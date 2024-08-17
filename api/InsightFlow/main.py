from typing import Dict, Optional
from llama_index.readers.file import PDFReader
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from tempfile import NamedTemporaryFile
from supabase import create_client, Client
from datetime import datetime, timezone
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from InsightFlow.VectorDBInteractor import VectorDBInteractor
from openai import OpenAI
from pydantic import BaseModel
from InsightFlow.utils import file_name_formatter, create_project_vec_table

load_dotenv(".env.local")

# Initialize Supabase client
SUPABASE_URL: str = os.environ.get("PUBLIC_SUPABASE_URL")
SUPABASE_KEY: str = os.environ.get("PUBLIC_SUPABASE_ANON_KEY")
FRONTEND_HOST: str = os.environ.get("FRONTEND_HOST_URL")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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


# Define the ProjectDetails schema
class ProjectDetails(BaseModel):
    title: str
    description: str
    requirements: str


@app.post("/api/projects/")
async def create_project(user_id: str = Form(...), file: UploadFile = File(...)):
    """
    Create a new project by extracting information from a PDF file.

    Args:
        user_id (str): The ID of the user creating the project.
        file (UploadFile): The PDF file containing the project information.

    Returns:
        dict: A message indicating the success of the operation along with the project data.

    Raises:
        HTTPException: If there is an issue processing the file or inserting the project into the database.
    """
    try:
        # Step 1: Read the PDF file
        pdf_reader = PDFReader()
        with NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        # Extract text from the PDF
        extracted_text = pdf_reader.load_data(temp_file_path)[0].text

        # Step 2: Use GPT to extract relevant data (title, description, requirements)
        completion = openai.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",  # Replace it with the appropriate model version
            messages=[
                {"role": "system", "content": "You are an expert at structured data extraction. You will be given "
                                              "unstructured text from a business system description and should "
                                              "convert it into the given structure."},
                {"role": "user", "content": extracted_text},
            ],
            response_format=ProjectDetails,  # Use the defined schema
        )

        project_details = completion.choices[0].message.parsed

        # Step 3: Insert the project into the database
        project = supabase.schema("public").from_("projects").insert(
            {
                "user_id": user_id,
                "title": project_details.title,
                "description": project_details.description,
                "requirements": project_details.requirements,
            }
        ).execute()
        create_project_vec_table(project.data[0]["id"])

        # Step 4: Clean up the temporary file
        os.remove(temp_file_path)

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
        projects = supabase.schema("public").from_("projects").select("*").eq("user_id", user_id).execute()
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
        existing_file = supabase.schema("public").from_("files").select("id").eq("project_id", project_id).eq("file_name", file.filename).execute()

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
            supabase.schema("public").from_("files").update(
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
            supabase.schema("public").from_("files").insert(
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
        files = supabase.schema("public").from_("files").select("file_name, file_url, last_update_time").eq("project_id", project_id).execute()
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
        file = supabase.schema("public").from_("files").select("id").eq("project_id", project_id).eq("file_name", file_name).execute()
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
        supabase.schema("public").from_("files").delete().eq("project_id", project_id).eq("file_name", file_name).execute()

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
        files = supabase.schema("public").from_("files").select("file_url").eq("project_id", project_id).eq("ingested", False).execute()
        file_urls = [file['file_url'] for file in files.data]
    except Exception as e:
        print(f"An error occurred while fetching file URLs: {e}")
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
        filtered_data = vector_db_interactor.select_all(project_id)
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
        filtered_data = vector_db_interactor.select_all(project_id)
        return filtered_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/projects/{project_id}/insights/docs")
def get_all_docs_insights(project_id: str):
    # Fetch relevant data
    try:
        # Filter necessary data
        filtered_data = vector_db_interactor.select_all(project_id)
        return filtered_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/projects/{project_id}/rag_chat/")  # for chatting with persona & themes
async def rag_chat(project_id: str, query: str, filters: Optional[Dict[str, str]] = None):
    print(project_id, query)
    try:
        # TODO: need to make it streamable

        response_stream = await vector_db_interactor.rag_query(query, project_id, filters)
        return response_stream
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
