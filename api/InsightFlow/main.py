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
        # Log the actual exception message to diagnose the issue
        print(f"Exception occurred: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/upload_file/")
def upload_file(project_id: str = Form(...), file: UploadFile = File(...)):
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
        print(f"Exception occurred: {str(e)}")  # Print the exception for debugging
        raise HTTPException(status_code=400, detail=str(e))
