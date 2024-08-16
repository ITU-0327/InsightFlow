import shutil
from tempfile import gettempdir
from typing import List, Optional, Dict
from urllib.parse import urlparse

import aiohttp
from llama_index.core.indices.vector_store import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.vector_stores import MetadataFilters
from supabase import Client
import os
from llama_index.readers.file import PDFReader, CSVReader
from llama_index.program.openai import OpenAIPydanticProgram
from llama_index.core.extractors import PydanticProgramExtractor
from llama_index.core import SimpleDirectoryReader, get_response_synthesizer
from pydantic import BaseModel, Field
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.ingestion import IngestionPipeline
from dotenv import load_dotenv
load_dotenv(".env.local")
SUPABASE_DB_CONN: str = os.environ.get("PUBLIC_SUPABASE_DB_CONN_URL")
class NodeMetadata(BaseModel):
    """Model representing metadata extracted from the document."""

    tags: List[str] = Field(
        ..., description="A category of the text chunk, can ONLY be one of ['pain points','behaviour','goals','demographics']"
    )
    summary: str = Field(
        ..., description="A short summary of the text chunk no longer than 20 words"
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

    async def ingest_data(self, urls: List[str], project_id:str):
        yield "Started processing data"
        # LOADING
        ingestion_path = os.path.join(gettempdir(), 'ingestion_data')
        print(ingestion_path)
        os.makedirs(ingestion_path, exist_ok=True)
        for url in urls:
            await self._download_file(url, ingestion_path)
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
        #
        program_extractor = PydanticProgramExtractor(
            program=openai_program, input_key="input", show_progress=True
        )

        self.vector_store = SupabaseVectorStore(
            postgres_connection_string=(
                SUPABASE_DB_CONN
            ),
            collection_name=project_id, # Project ID
        )
        #
        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)

        pipeline = IngestionPipeline(
            transformations=[
                program_extractor
            ],
        )

        yield "Extracting Insights ... this might take a while"
        print("running pipeline")
        docs = await pipeline.arun(documents=downloaded_documents, num_workers=4)

        print("building index")

        self.index = VectorStoreIndex.from_documents(docs,storage_context, show_progress=True)

        yield "Preparing insights"

        # remove all locally stored data & cleanup
        # Cleanup
        shutil.rmtree(ingestion_path)
        print("deleted", ingestion_path)
        yield f"{"nodes"} Insights ready"

    async def rag_query(self, query: str, project_id: str, filters: Optional[Dict[str,str]] = None):
        # https://docs.llamaindex.ai/en/stable/examples/vector_stores/Qdrant_metadata_filter/

        metadata_filters = None # TODO: need to transform JSON into MetadataFilters
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
    def search(self, project_id: str, query: Dict[str, str] = None, count: int = 10):
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
        base_query = (
            self.supabase_client
            .schema("vecs")
            .from_(project_id)
            .select("id, vec, metadata->>summary as summary, metadata->tags as tags, metadata->>file_name as file_name, metadata->>suitable_for_persona as suitable_for_persona, metadata->_node_content as node_content")
        )

        if count:
            base_query = base_query.limit(count)
            # Execute the query
        try:
            response = base_query.execute()
            if response.error:
                raise Exception(f"Error executing search query: {response.error.message}")
            print(response)
            return response
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
    async def update(self, project_id: str, new_metadata):
        pass
    async def delete(self, project_id: str, filename: str):
        pass

    async def _download_file(self, url: str, dest_folder: str):
        parsed_url = urlparse(url)
        clean_url = parsed_url._replace(query="").geturl()
        filename = clean_url.split('/')[-1].replace(" ", "_")
        file_path = os.path.join(dest_folder, filename)
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as r:
                r.raise_for_status()
                with open(file_path, 'wb') as f:
                    while True:
                        chunk = await r.content.read(1024 * 8)
                        if not chunk:
                            break
                        f.write(chunk)
                        f.flush()
                        os.fsync(f.fileno())
