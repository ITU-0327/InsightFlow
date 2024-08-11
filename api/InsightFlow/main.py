from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv(".env.local")

app = FastAPI()

# Initialize Supabase client
SUPABASE_URL: str = os.environ.get("PUBLIC_SUPABASE_URL")
SUPABASE_KEY: str = os.environ.get("PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/create_project/")
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


@app.post("/upload_file/")
def upload_file(project_id: str = Form(...), file: UploadFile = File(...)):
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
        # Define a unique file path
        file_path = f"{project_id}/{file.filename}"

        # Save the file locally first
        with open(file.filename, "wb") as buffer:
            buffer.write(file.file.read())

        # Upload the file to Supabase storage
        supabase.storage.from_("file-storage").upload(file=file.filename, path=file_path)

        file_url = supabase.storage.from_('file-storage').get_public_url(file_path)

        # Store the file reference in the database
        supabase.table("files").insert(
            {
                "project_id": project_id,
                "file_name": file.filename,
                "file_url": file_url,
            }
        ).execute()

        return {"message": "File uploaded successfully!", "file_url": file_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
