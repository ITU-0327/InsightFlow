import os
import shutil
import psycopg2
import json
from supabase import Client
from tempfile import gettempdir
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from InsightFlow.utils import _download_file

from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.extractors import PydanticProgramExtractor
from llama_index.core.indices.vector_store import VectorIndexRetriever
from llama_index.core import SimpleDirectoryReader, get_response_synthesizer, VectorStoreIndex, StorageContext
from llama_index.readers.file import PDFReader, CSVReader
from llama_index.program.openai import OpenAIPydanticProgram
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core import PromptTemplate
from llama_index.core.postprocessor import LLMRerank


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
        yield "data: Started processing data\n\n"

        ingestion_path = os.path.join(gettempdir(), 'ingestion_data')
        print(ingestion_path)
        os.makedirs(ingestion_path, exist_ok=True)

        for url in urls:
            await _download_file(url, ingestion_path)
        print("data: extracting file .....")

        file_extractor = {".pdf": PDFReader(), ".csv": CSVReader(concat_rows=False)}
        downloaded_documents = SimpleDirectoryReader(
            ingestion_path, file_extractor=file_extractor
        ).load_data()

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
            postgres_connection_string=SUPABASE_DB_CONN,
            collection_name=project_id,  # Project ID
        )

        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)

        pipeline = IngestionPipeline(
            transformations=[
                program_extractor
            ],
        )

        yield "data: Extracting Insights ... this might take a while\n\n"
        print("running pipeline")
        docs = await pipeline.arun(documents=downloaded_documents, num_workers=10)

        print("building index")

        self.index = VectorStoreIndex.from_documents(docs, storage_context, show_progress=True)

        yield "data: Preparing insights\n\n"

        # remove all locally stored data
        shutil.rmtree(ingestion_path)
        print("deleted", ingestion_path)
        yield f"data: {len(docs)} Insights ready\n\n"

    async def rag_query(self, query: str, project_id: str, role_prompt:str ,filters: Optional[Dict[str, str]] = None):
        # https://docs.llamaindex.ai/en/stable/examples/vector_stores/Qdrant_metadata_filter/
        metadata_filters = None  # TODO: need to transform JSON into MetadataFilters
        if self.vector_store is None:
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
            similarity_top_k=10,
        )

        # Configure response synthesizer
        # TODO: make the response streamable
        # response_synthesizer = get_response_synthesizer(streaming=True)
        # Ensure role_prompt is a string before concatenation
        role_prompt = str(role_prompt)

        # Create the prompt template with the correct string formatting
        prompt_template_str = (
            "Context information is below.\n"
            "---------------------\n"
            "{context_str}\n"
            "---------------------\n"
            "Given the context information and not prior knowledge, "
            f"Given your ROLE: {role_prompt}.\n"
            "Answer the question.\n"
            "Query: {query_str}\n"
            "Answer: "
        )

        # Initialize the PromptTemplate object with the formatted string
        prompt_template = PromptTemplate(prompt_template_str)

        # Configure the response synthesizer with the custom prompt template
        response_synthesizer = get_response_synthesizer(response_mode="compact", text_qa_template=prompt_template)

        # Assemble query engine
        query_engine = RetrieverQueryEngine(
            retriever=retriever,
            response_synthesizer=response_synthesizer,
            node_postprocessors=[LLMRerank(
            choice_batch_size=5,
            top_n=3,
        )]
        )
        streaming_response = query_engine.query(query)
        return streaming_response

    def get_base_query(self, project_id: str):
        base_query = (
            self.supabase_client
            .schema("vecs")
            .from_(project_id)
            .select(
                "id, vec, theme, cluster_id, persona_id, "
                "metadata->>note, metadata->tags, metadata->theme, metadata->persona_id, "
                "metadata->>file_name, metadata->>suitable_for_persona, metadata->_node_content"
            )
        )
        return base_query

    def select_all(self, project_id: str, count: int = 40):
        """
        Searches the Supabase table for entries matching the query/filter criteria.

        Args:
            project_id (str): The ID of the project or table to search within.
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
