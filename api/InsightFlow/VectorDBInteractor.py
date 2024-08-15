import shutil
from typing import List
from supabase import Client
import os
import requests
from llama_index.readers.file import PDFReader, CSVReader
from llama_index.program.openai import OpenAIPydanticProgram
from llama_index.core.extractors import PydanticProgramExtractor
from llama_index.core import SimpleDirectoryReader
from pydantic import BaseModel, Field
import nest_asyncio
from llama_index.core import VectorStoreIndex, get_response_synthesizer , StorageContext
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.ingestion import IngestionPipeline
from dotenv import load_dotenv

class NodeMetadata(BaseModel):
    tags: List[str] = Field(
        ..., description="A category of the text chunk, can ONLY be one of ['pain points','behaviour','goals','demographics']"
    )
    summary: str = Field(
        ..., description="A short summary of the text chunk no longer than 50 words"
    )
    suitable_for_persona: bool = Field(
        ...,
        description="Whether the text chunk is suitable to build a customer persona for UX research",
    )

class VectorDBInteractor:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(VectorDBInteractor, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self, supabase_client: Client):
        if not hasattr(self, 'initialized'):
            self.supabase_client = supabase_client
            self.initialized = True

    def ingest_data(self, urls: List[str], project_id:str):
        yield "Started processing data"
        load_dotenv(".env.local")
        SUPABASE_DB_CONN: str = os.environ.get("PUBLIC_SUPABASE_DB_CONN_URL")

        # LOADING
        os.makedirs('/ingestion_data', exist_ok=True)
        for url in urls:
            self._download_file(url, '/ingestion_data')

        file_extractor = {".pdf": PDFReader(), ".csv": CSVReader(concat_rows=False)}
        downloaded_documents = SimpleDirectoryReader(
            "./ingestion_data", file_extractor=file_extractor
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
            extract_template_str=EXTRACT_TEMPLATE_STR
        )

        program_extractor = PydanticProgramExtractor(
            program=openai_program, input_key="input", show_progress=True
        )
        
        vector_store = SupabaseVectorStore(
            postgres_connection_string=(
                SUPABASE_DB_CONN
            ),
            collection_name=project_id, # Project ID
        )
        
        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        pipeline = IngestionPipeline(
            transformations=[
                program_extractor
            ],
        )   
        
        yield "Extracting Insights ... this might take a while"
        nodes = pipeline.run(documents=downloaded_documents)
        
        index = VectorStoreIndex(
            nodes,
            storage_context=storage_context,
            show_progress=True,
            use_async=True,
        )
        
        yield "Preparing insights"
        
        # remove all locally stored data & cleanup
        # Cleanup
        shutil.rmtree('/ingestion_data')
        yield f"{len(nodes)} Insights ready"
    
        
    def _download_file(self, url: str, dest_folder: str):
        filename = url.split('/')[-1].replace(" ", "_")
        file_path = os.path.join(dest_folder, filename)
        r = requests.get(url, stream=True, timeout=3000)
        if r.ok:
            with open(file_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=1024 * 8):
                    if chunk:
                        f.write(chunk)
                        f.flush()
                        os.fsync(f.fileno())
        else:
            print(f"Download failed: status code {r.status_code}\n{r.text}")
