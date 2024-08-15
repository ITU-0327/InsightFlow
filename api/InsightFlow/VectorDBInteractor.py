import shutil
from tempfile import gettempdir
from typing import List
from urllib.parse import urlparse

import aiohttp
from supabase import Client
import os
from llama_index.readers.file import PDFReader, CSVReader
from llama_index.program.openai import OpenAIPydanticProgram
from llama_index.core.extractors import PydanticProgramExtractor
from llama_index.core import SimpleDirectoryReader
from pydantic import BaseModel, Field
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.ingestion import IngestionPipeline
from dotenv import load_dotenv

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

    async def ingest_data(self, urls: List[str], project_id:str):
        yield "Started processing data"
        load_dotenv(".env.local")
        SUPABASE_DB_CONN: str = os.environ.get("PUBLIC_SUPABASE_DB_CONN_URL")
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

        vector_store = SupabaseVectorStore(
            postgres_connection_string=(
                SUPABASE_DB_CONN
            ),
            collection_name=project_id, # Project ID
        )
        #
        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        pipeline = IngestionPipeline(
            transformations=[
                program_extractor
            ],
        )

        yield "Extracting Insights ... this might take a while"
        print("running pipeline")
        docs = await pipeline.arun(documents=downloaded_documents, num_workers=4)

        print("building index")
        # WITHOUT PIPELINE & METADATA EXTRACTION
        index = VectorStoreIndex.from_documents(docs,storage_context, show_progress=True)

        yield "Preparing insights"

        # remove all locally stored data & cleanup
        # Cleanup
        shutil.rmtree(ingestion_path)
        print("deleted", ingestion_path)
        yield f"{"nodes"} Insights ready"

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
