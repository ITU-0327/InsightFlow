import asyncio
import os
import shutil
from tempfile import gettempdir
from typing import List, Optional, Dict
import pandas as pd
from supabase import Client

from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.extractors import PydanticProgramExtractor
from llama_index.core.indices.vector_store import VectorIndexRetriever
from llama_index.core import SimpleDirectoryReader, get_response_synthesizer, VectorStoreIndex, StorageContext
from llama_index.readers.file import PDFReader, CSVReader
from llama_index.program.openai import OpenAIPydanticProgram
from llama_index.vector_stores.supabase import SupabaseVectorStore

from pydantic import BaseModel, Field
from InsightFlow.utils import _download_file

from dotenv import load_dotenv

load_dotenv(".env.local")
SUPABASE_DB_CONN: str = os.environ.get("PUBLIC_SUPABASE_DB_CONN_URL")


class NodeMetadata(BaseModel):
    """Model representing metadata extracted from the document."""
    tags: List[str] = Field(
        ...,
        description="A category of the text chunk, can ONLY be one of ['pain points','behaviour','goals',"
                    "'demographics']"
    )
    note: str = Field(
        ...,
        description="An interesting insight note of the text chunk no longer than 20 words"
    )
    suitable_for_persona: bool = Field(
        ...,
        description="Whether the text chunk is suitable to build a customer persona for UX research",
    )


class VectorDBInteractor:
    def __init__(self, supabase_client: Client):
        if not hasattr(self, 'initialized'):
            self.supabase_client = supabase_client
            self.initialized = True
            self.index = None
            self.vector_store = None

    async def ingest_data(self, urls: List[str], project_id: str):
        yield "Started processing data"
        # LOADING
        ingestion_path = os.path.join(gettempdir(), 'ingestion_data')
        print(ingestion_path)
        os.makedirs(ingestion_path, exist_ok=True)
        for url in urls:
            await _download_file(url, ingestion_path)
        print("extracting file .....")
        file_extractor = {".pdf": PDFReader(), ".csv": CSVReader(concat_rows=False)}
        downloaded_documents = SimpleDirectoryReader(
            ingestion_path, file_extractor=file_extractor
        ).load_data()

        # METADATA EXTRACTION
        EXTRACT_TEMPLATE_STR = """\
        Here is the content of the section please adhere to keywords like `ONLY`:
        ----------------
        {context_str}
        ----------------
        Given the contextual information, extract out a {class_name} object.\
        """

        openai_program = OpenAIPydanticProgram.from_defaults(
            output_cls=NodeMetadata,
            prompt_template_str="{input}",
            extract_template_str=EXTRACT_TEMPLATE_STR,
            description="Program to extract metadata from documents based on NodeMetadata model."
        )

        program_extractor = PydanticProgramExtractor(
            program=openai_program, input_key="input", show_progress=True
        )

        self.vector_store = SupabaseVectorStore(
            postgres_connection_string=(
                SUPABASE_DB_CONN
            ),
            collection_name=project_id,  # Project ID
        )

        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)

        pipeline = IngestionPipeline(
            transformations=[
                program_extractor
            ],
        )

        yield "Extracting Insights ... this might take a while"
        print("running pipeline")
        docs = await pipeline.arun(documents=downloaded_documents, num_workers=10)

        print("building index")

        self.index = VectorStoreIndex.from_documents(docs, storage_context, show_progress=True)

        yield "Preparing insights"

        # remove all locally stored data
        # Cleanup
        shutil.rmtree(ingestion_path)
        print("deleted", ingestion_path)
        yield f"{len(docs)} Insights ready"

    async def rag_query(self, query: str, project_id: str, filters: Optional[Dict[str, str]] = None):
        # https://docs.llamaindex.ai/en/stable/examples/vector_stores/Qdrant_metadata_filter/

        metadata_filters = None  # TODO: need to transform JSON into MetadataFilters
        if self.vector_store is None:
            print(self.vector_store, "vec")
            self.vector_store = SupabaseVectorStore(
                postgres_connection_string=SUPABASE_DB_CONN,
                collection_name=project_id,  # Project ID
            )

        if self.index is None:
            self.index = VectorStoreIndex.from_vector_store(vector_store=self.vector_store)

        # Configure retriever
        retriever = VectorIndexRetriever(
            filters=metadata_filters,
            index=self.index,
            similarity_top_k=5,
        )

        # Configure response synthesizer
        # TODO: make the response streamable
        # response_synthesizer = get_response_synthesizer(streaming=True)
        response_synthesizer = get_response_synthesizer()

        # Assemble query engine
        query_engine = RetrieverQueryEngine(
            retriever=retriever,
            response_synthesizer=response_synthesizer,
        )
        streaming_response = query_engine.query(query)
        return streaming_response

    def get_base_query(self,project_id:str):
        base_query = (
            self.supabase_client
            .schema("vecs")
            .from_(project_id)
            .select(
                "id, vec, theme, cluster_id, persona_id, metadata->>note, metadata->tags, metadata->theme, metadata->persona_id, "
                "metadata->>file_name, metadata->>suitable_for_persona, "
                "metadata->_node_content"
            )
        )
        return base_query
    
    def select_all(self, project_id: str, query: Dict[str, str] = None, count: int = 40):
        """
        Searches the Supabase table for entries matching the query/filter criteria.

        Args:
            project_id (str): The ID of the project or table to search within.
            query (Dict[str, str], optional): A dictionary containing additional filtering conditions.
            count (int, optional): The maximum number of results to return.

        Returns:
            Any: The search results.
        """

        # Base query: selecting the required fields without any filters
        base_query = self.get_base_query(project_id=project_id)

        # Limit the number of results
        base_query = base_query.limit(count)

        try:
            # Execute the query
            response = base_query.execute()

            # Print and return the data
            data = response.data
            # print(f"Data: {data}")
            return data

        except Exception as e:
            print(f"An error occurred: {e}")
            return None
    
    def select_group_by_themes(self, project_id: str, cluster_notes_limit: int = 10):
        """
        Groups and retrieves a limited number of records for each theme.

        Args:
            project_id (str): The ID of the project or table to search within.
            cluster_notes_limit (int, optional): The maximum number of results to return per theme.

        Returns:
            dict: A dictionary where keys are themes and values are lists of records.
        """
        grouped_results = {}
        
        try:
            # Query only with non-null theme and cluster_id, group by theme
            base_query = (
                self.supabase_client
                .schema("vecs")
                .from_(project_id)
                .select(
                    "id, theme, cluster_id, persona_id, metadata->>note, metadata->tags, metadata->theme, metadata->persona_id, "
                    "metadata->>file_name, metadata->>suitable_for_persona"
                )
                .filter("theme","neq","")
            )

            # Get distinct themes
            response = (
                self.supabase_client
                .schema("vecs")
                .from_(project_id)
                .select("cluster_id, theme")
                .execute()
            )
            
            unique_clusters = {}
            for item in response.data:
                if item['cluster_id']:  # Ensure cluster_id is present
                    unique_clusters[item['cluster_id']] = item['theme']

            # Convert the dictionary to a list of dictionaries or tuples if needed
            clusters = [{'cluster_id': cluster_id, 'theme': theme} for cluster_id, theme in unique_clusters.items()]

            print(clusters)
            for cluster in clusters:
                # For each theme, limit the results to the specified number
                notes = self.get_cluster_notes(project_id,cluster_id=cluster['cluster_id'])
                
                grouped_results[cluster['theme']] = notes if notes else []
        except Exception as e:
            print(f"An error occurred: {e}")
        
        return grouped_results

    def get_cluster_notes(self,project_id,cluster_id, count=10):
        query = (
                self.supabase_client
                .schema("vecs")
                .from_(project_id)
                .select(
                    "id, theme, cluster_id, persona_id, metadata->>note, metadata->tags, metadata->theme, metadata->persona_id, "
                    "metadata->>file_name, metadata->>suitable_for_persona"
                )
                .filter("theme","neq","")
                .eq("cluster_id",cluster_id)
            )
        return query.execute()

    async def batch_update(self, df: pd.DataFrame, project_id: str, update_columns: Dict[str, str], match_column: str):
        """
        Updates records in the Supabase database based on the DataFrame asynchronously.

        Args:
            df (pd.DataFrame): The DataFrame containing the updated information.
            project_id (str): The project ID to specify the table to update.
            update_columns (Dict[str, str]): A dictionary mapping DataFrame column names to Supabase column names.
            match_column (str): The column name in the DataFrame to match with the Supabase records.
        """
        print("Updating batch data asynchronously...")
        
        async def update_record(row):
            update_data = {supabase_col: row[df_col] for df_col, supabase_col in update_columns.items()}
            print(f"Updating: {update_data}")
            
            response = await self.supabase_client \
                .schema("vecs") \
                .from_(project_id) \
                .update(update_data) \
                .eq("id", row.get(match_column)) \
                .execute()

        tasks = [update_record(row) for _, row in df.iterrows()]
        await asyncio.gather(*tasks)
    
    async def delete(self, project_id: str, filename: str):
        pass
