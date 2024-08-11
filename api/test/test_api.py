from dotenv import load_dotenv
from fastapi.testclient import TestClient
load_dotenv("../.env.local")
from InsightFlow.main import app

# Initialize the test client
client = TestClient(app)


def test_create_project_success():
    response = client.post("/api/projects/", data={
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
    response = client.post("/api/projects/", data={
        "user_id": "test_user",
        "title": "Test Project",
        "description": "This is a test project description."
        # Missing 'requirements'
    })
    assert response.status_code == 422  # FastAPI will automatically raise a validation error for missing fields


def test_get_user_projects():
    response = client.get("/api/users/test_user/projects/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # Expecting a list of projects


def test_upload_file_success(tmp_path):
    # Create a temporary file for testing
    test_file = tmp_path / "test_file.txt"
    test_file.write_text("This is a test file to check if the file correctly update, after the file is uploaded.")

    with open(test_file, "rb") as file:
        response = client.post(f"/projects/29342ce6-6892-468a-aba5-9875911b82cc/files/",
                               files={"file": file})

    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "File uploaded successfully!"
    assert "file_url" in response.json()


def test_upload_file_failure():
    # No file provided
    response = client.post("/api/projects/test_project/files/")
    assert response.status_code == 422  # FastAPI will raise a validation error for missing file


def test_get_project_files():
    response = client.get("/api/projects/29342ce6-6892-468a-aba5-9875911b82cc/files/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # Expecting a list of files
    if response.json():
        assert "file_name" in response.json()[0]
        assert "file_url" in response.json()[0]
        assert "last_update_time" in response.json()[0]


def test_delete_file_success():
    # Assume there's a file to delete with a known project_id and file_name
    project_id = "29342ce6-6892-468a-aba5-9875911b82cc"
    file_name = "test_file.txt"

    # Make the DELETE request with project_id and file_name as query parameters
    response = client.delete("/api/files/", params={"project_id": project_id, "file_name": file_name})

    # Assert the response
    assert response.status_code == 200
    assert response.json() == {"message": "File deleted successfully!"}


def test_delete_file_failure():
    # Attempting to delete a non-existing file
    project_id = "29342ce6-6892-468a-aba5-9875911b82cc"
    file_name = "non_existing_file.txt"

    # Make the DELETE request with project_id and non-existing file_name as query parameters
    response = client.delete("/api/files/", params={"project_id": project_id, "file_name": file_name})

    # Assert the response
    assert response.status_code == 404  # Expecting a "File not found" error
    assert "detail" in response.json()
    assert response.json()["detail"] == "File not found in the database"
