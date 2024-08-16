from typing import Dict, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse
from tempfile import NamedTemporaryFile
from supabase import create_client, Client
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
import re
from starlette.responses import StreamingResponse
# from InsightFlow.VectorDBInteractor import VectorDBInteractor
# from VectorDBInteractor import VectorDBInteractor
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
        ...,
        description="A category of the text chunk, can ONLY be one of ['pain points','behaviour','goals','demographics']"
    )
    note: str = Field(
        ..., description="An interesting insight note of the text chunk no longer than 20 words"
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
            collection_name=project_id,  # Project ID
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

        self.index = VectorStoreIndex.from_documents(docs, storage_context, show_progress=True)

        yield "Preparing insights"

        # remove all locally stored data & cleanup
        # Cleanup
        shutil.rmtree(ingestion_path)
        print("deleted", ingestion_path)
        yield f"{"nodes"} Insights ready"

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

    def search(self, project_id: str, query: Dict[str, str] = None, count: int = 40):
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
            .select(
                "id, vec, metadata->>note, metadata->tags, metadata->theme, metadata->persona_id, "
                "metadata->>file_name, metadata->>suitable_for_persona, "
                "metadata->_node_content"
            )
        )

        # Apply user-specified filters
        if query:
            for key, value in query.items():
                base_query = base_query.eq(f"metadata->{key}",value)


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
load_dotenv(".env.local")

# Initialize Supabase client
SUPABASE_URL: str = os.environ.get("PUBLIC_SUPABASE_URL")
SUPABASE_KEY: str = os.environ.get("PUBLIC_SUPABASE_ANON_KEY")
FRONTEND_HOST: str = os.environ.get("FRONTEND_HOST_URL")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_HOST],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict methods if needed
    allow_headers=["*"],  # You can restrict headers if needed
)


vector_db_interactor = VectorDBInteractor(supabase_client=supabase)

def file_name_formatter(file_name: str) -> str:
    """
    Format the file name by removing spaces and illegal characters.

    Args:
        file_name (str): The original file name.

    Returns:
        str: The formatted file name.
    """
    file_name = file_name.strip()
    file_name = file_name.replace(" ", "_")
    file_name = re.sub(r'[^\w\-.]', '', file_name)
    return file_name

@app.post("/api/projects/")
def create_project(user_id: str = Form(...), title: str = Form(...), description: str = Form(...), requirements: str = Form(...)):
    """
    Create a new project.

    Args:
        user_id (str): The ID of the user creating the project.
        title (str): The title of the project.
        description (str): A brief description of the project.
        requirements (str): The requirements or specifications of the project.

    Returns:
        dict: A message indicating the success of the operation along with the project data.

    Raises:
        HTTPException: If there is an issue inserting the project into the database.
    """
    try:
        project = supabase.table("projects").insert(
            {
                "user_id": user_id,
                "title": title,
                "description": description,
                "requirements": requirements,
            }
        ).execute()
        return {"message": "Project created successfully!", "data": project.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/users/{user_id}/projects/")
def get_user_projects(user_id: str):
    """
    Retrieve all projects for a specific user.

    Args:
        user_id (str): The ID of the user whose projects are being retrieved.

    Returns:
        list: A list of projects associated with the specified user.

    Raises:
        HTTPException: If there is an issue retrieving the projects from the database.
    """
    try:
        projects = supabase.table("projects").select("*").eq("user_id", user_id).execute()
        return projects.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/projects/{project_id}/files/")
async def upload_file(project_id: str, file: UploadFile = File(...)):
    """
    Upload a file to a specific project.

    Args:
        project_id (str): The ID of the project to which the file belongs.
        file (UploadFile): The file to be uploaded.

    Returns:
        dict: A message indicating the success of the operation along with the public URL of the uploaded file.

    Raises:
        HTTPException: If there is an issue with saving the file or uploading it to storage.
    """
    try:
        formatted_file_name = file_name_formatter(file.filename)

        # Define a unique file path
        file_path = f"{project_id}/{formatted_file_name}"

        # Stream the file content directly to Supabase
        file_content = await file.read()

        # Check if the file already exists in the database
        existing_file = supabase.table("files").select("id").eq("project_id", project_id).eq("file_name", file.filename).execute()

        current_time = datetime.now(timezone.utc).isoformat()

        if existing_file.data and len(existing_file.data) == 1:
            # Upload or update the file in Supabase storage
            supabase.storage.from_("file-storage").update(
                file=file_content,
                path=file_path,
                file_options={"cache-control": "3600", "upsert": "true"}
            )

            # Get the public URL of the uploaded file
            file_url = supabase.storage.from_("file-storage").get_public_url(file_path)

            # Update existing file record with new URL and timestamp
            supabase.table("files").update(
                {
                    "file_url": file_url,
                    "last_update_time": current_time
                }
            ).eq("id", existing_file.data[0]["id"]).execute()
        else:
            # Upload the file to Supabase storage
            supabase.storage.from_("file-storage").upload(file=file_content, path=file_path)

            # Get the public URL of the uploaded file
            file_url = supabase.storage.from_("file-storage").get_public_url(file_path)

            # Insert a new file record in the database
            supabase.table("files").insert(
                {
                    "project_id": project_id,
                    "file_name": formatted_file_name,
                    "file_url": file_url,
                    "last_update_time": current_time,
                    "created_at": current_time
                }
            ).execute()

        return {"message": "File uploaded successfully!", "file_url": file_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
# @app.post("/api/projects/{project_id}/files/")
# def upload_project_background_file(project_id: str, file: UploadFile = File(...)):
    

@app.get("/api/projects/{project_id}/files/")
def get_project_files(project_id: str):
    """
    Retrieve all files for a specific project.

    Args:
        project_id (str): The ID of the project whose files are being retrieved.

    Returns:
        list: A list of files associated with the specified project, including file name, URL, and last update time.

    Raises:
        HTTPException: If there is an issue retrieving the files from the database.
    """
    try:
        files = supabase.table("files").select("file_name, file_url, last_update_time").eq("project_id", project_id).execute()
        return files.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/files/")
def delete_file(project_id: str, file_name: str):
    """
    Delete a specific file by project ID and file name.

    Args:
        project_id (str): The ID of the project to which the file belongs.
        file_name (str): The name of the file to be deleted.

    Returns:
        dict: A message indicating the success of the operation.

    Raises:
        HTTPException: If there is an issue deleting the file from the database or storage.
    """
    try:
        file_path = f"{project_id}/{file_name}"

        # Check if the file exists in the database
        file = supabase.table("files").select("id").eq("project_id", project_id).eq("file_name", file_name).execute()
        if not file.data:
            raise HTTPException(status_code=404, detail="File not found in the database")

        # Check if the file exists in Supabase storage
        files_in_storage = supabase.storage.from_("file-storage").list(project_id)
        file_exists_in_storage = any(f["name"] == file_name for f in files_in_storage)
        if not file_exists_in_storage:
            raise HTTPException(status_code=404, detail="File not found in storage")

        # Remove the file from Supabase storage
        supabase.storage.from_("file-storage").remove([file_path])

        # Delete the file record from the database
        supabase.table("files").delete().eq("project_id", project_id).eq("file_name", file_name).execute()

        return {"message": "File deleted successfully!"}

    except HTTPException as e:
        # Re-raise HTTPExceptions to preserve the status code and message
        raise e
    except Exception as e:
        # Handle other exceptions
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/projects/{project_id}/files/{file_name}/download/")
def download_file(project_id: str, file_name: str):
    """
    Download a specific file by project ID and file name.

    Args:
        project_id (str): The ID of the project to which the file belongs.
        file_name (str): The name of the file to be downloaded.

    Returns:
        FileResponse: A response containing the file for download.

    Raises:
        HTTPException: If there is an issue downloading the file from storage.
    """
    try:
        file_path = f"{project_id}/{file_name}"

        # Check if the file exists in Supabase storage
        try:
            file_res = supabase.storage.from_("file-storage").download(file_path)
        except Exception:
            raise HTTPException(status_code=404, detail="File not found in storage")

        # Use NamedTemporaryFile to store the file temporarily before sending it
        with NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(file_res)
            temp_file_path = temp_file.name

        return FileResponse(temp_file_path, media_type="application/octet-stream", filename=file_name)

    except HTTPException as e:
        # Re-raise HTTPExceptions to preserve the status code and message
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/projects/{project_id}/ingest/")
async def ingest_data(project_id: str):
    # Fetch file URLs
    file_urls = []
    try:
        files = supabase.table("files").select("file_url").eq("project_id", project_id).eq("ingested", False).execute()
        file_urls = [file['file_url'] for file in files.data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Define the event generator function
    async def event_generator():
        async for message in vector_db_interactor.ingest_data(file_urls, project_id):
            yield f"data: {message}\n\n"

    # Use StreamingResponse to stream data
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/projects/{project_id}/themes/")
def create_theme_insights(project_id: str):
    # Fetch relevant data
    try:
        # Filter necessary data
        filtered_data = vector_db_interactor.search(project_id)
        # TODO:Load it to memory as a pandas dataframe
        # TODO:Run clustering algo
        # TODO:Pick the right k
        # TODO:Generate cluster names
        # TODO:Update Vector DB metadata
        return filtered_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.get("/api/projects/{project_id}/themes/")
def get_theme_insights(project_id: str):
    # Fetch relevant data
    try:
        # Filter necessary data GROUP by theme
        filtered_data = vector_db_interactor.search(project_id)

        return filtered_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/projects/{project_id}/insights/docs")
def get_all_docs_insights(project_id: str):
    # Fetch relevant data
    try:
        # Filter necessary data
        filtered_data = vector_db_interactor.search(project_id)
        return filtered_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/projects/{project_id}/rag_chat/") # for chatting with persona & themes
async def rag_chat(project_id: str, query: str, filters: Optional[Dict[str,str]] = None):
    try:
        # TODO: need to make it streamable
        response_stream = await vector_db_interactor.rag_query(query, project_id, filters)
        return response_stream
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))