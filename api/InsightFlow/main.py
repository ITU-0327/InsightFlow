import logging
from urllib.parse import urlparse

import aiohttp
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse
from tempfile import NamedTemporaryFile, gettempdir
from supabase import create_client, Client
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
import re
from starlette.responses import StreamingResponse
# from VectorDBInteractor import VectorDBInteractor

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

# cannot import so I moved the whole thing
class NodeMetadata(BaseModel):
    """Model representing metadata extracted from the document."""

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
        # await self._download_file("https://aijhishknsqntpzzthuf.supabase.co/storage/v1/object/public/file-storage/8a95c770-8f11-4b59-ad57-30954fb1e2e4/Cuppabun_Responses_-_Form_responses_1.csv", ingestion_path)
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


# Init VectorDBInteractor
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


@app.get("/api/projects/{project_id}/ingest/")
async def ingest_data(request: Request, project_id: str):

    # Fetch file URLs
    file_urls = []
    try:
        files = supabase.table("files").select("file_url").eq("project_id", project_id).eq("ingested",False).execute()
        file_urls = [file['file_url'] for file in files.data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ingest files
    async def event_generator():
        async for message in vector_db_interactor.ingest_data(file_urls, project_id):
            if await request.is_disconnected():
                break
            yield f"data: {message}\n\n"
            
    return StreamingResponse(event_generator())

    # mark all files as ingested


