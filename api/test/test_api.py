from dotenv import load_dotenv
from fastapi.testclient import TestClient
load_dotenv("../.env.local")
from InsightFlow.main import app

# Initialize the test client
client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}


def test_create_project_success():
    response = client.post("/create_project/", data={
        "user_id": "test_user",
        "title": "Test Project",
        "description": "This is a test project description.",
        "requirements": "These are the test requirements."
    })
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Project created successfully!"
    assert "data" in response.json()


def test_create_project_failure():
    # Missing one of the required fields
    response = client.post("/create_project/", json={
        "user_id": "test_user",
        "title": "Test Project",
        "description": "This is a test project description."
        # Missing 'requirements'
    })
    assert response.status_code == 422  # FastAPI will automatically raise a validation error for missing fields


def test_upload_file_success(tmp_path):
    # Create a temporary file for testing
    test_file = tmp_path / "test_file.txt"
    test_file.write_text("This is a test file.")

    with open(test_file, "rb") as file:
        response = client.post("/upload_file/", files={"file": file}, data={"project_id": "29342ce6-6892-468a-aba5-9875911b82cc"})

    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "File uploaded successfully!"
    assert "file_url" in response.json()


def test_upload_file_failure():
    # No file provided
    response = client.post("/upload_file/", data={"project_id": "test_project"})
    assert response.status_code == 422  # FastAPI will raise a validation error for missing file
