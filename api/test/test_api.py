from dotenv import load_dotenv
from fastapi.testclient import TestClient
load_dotenv("../.env.local")
from InsightFlow.main import app

# Initialize the test client
client = TestClient(app)

# !! Need to match the project_id in the database as it's a foreign key for the files
TEST_PROJECT_ID = "f420aa14-a549-4b2e-8499-b1cb113c23fa"
TEST_FILE_NAME = "test_file.txt"
NON_EXISTING_FILE_NAME = "non_existing_file.txt"


def test_create_project_success():
    response = client.post("/projects/", data={
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
    response = client.post("/projects/", data={
        "user_id": "test_user",
        "title": "Test Project",
        "description": "This is a test project description."
        # Missing 'requirements'
    })
    assert response.status_code == 422  # FastAPI will automatically raise a validation error for missing fields


def test_get_user_projects():
    response = client.get("/users/test_user/projects/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # Expecting a list of projects


def test_upload_file_success(tmp_path):
    # Create a temporary file for testing
    test_file = tmp_path / TEST_FILE_NAME
    test_file.write_text("This is a test file to check if the file correctly update, after the file is uploaded.")

    with open(test_file, "rb") as file:
        response = client.post(f"/projects/{TEST_PROJECT_ID}/files/",
                               files={"file": file})

    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "File uploaded successfully!"
    assert "file_url" in response.json()


def test_upload_file_failure():
    # No file provided
    response = client.post("/projects/test_project/files/")
    assert response.status_code == 422  # FastAPI will raise a validation error for missing file


def test_get_project_files():
    response = client.get(f"/projects/{TEST_PROJECT_ID}/files/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # Expecting a list of files
    if response.json():
        assert "file_name" in response.json()[0]
        assert "file_url" in response.json()[0]
        assert "last_update_time" in response.json()[0]


def test_download_file_success():
    # Assuming the file was uploaded successfully in a previous test
    response = client.get(f"/projects/{TEST_PROJECT_ID}/files/{TEST_FILE_NAME}/download/")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/octet-stream"

    # Adjust the assertion to account for quoted filename
    content_disposition = response.headers["content-disposition"]
    expected_disposition = f'attachment; filename="{TEST_FILE_NAME}"'

    assert content_disposition.startswith(expected_disposition)


def test_download_file_failure():
    # Attempting to download a non-existing file
    response = client.get(f"/projects/{TEST_PROJECT_ID}/files/{NON_EXISTING_FILE_NAME}/download/")

    assert response.status_code == 404  # Expecting a "File not found" error
    assert "detail" in response.json()
    assert response.json()["detail"] == "File not found in storage"


def test_delete_file_success():
    # Assume there's a file to delete with a known project_id and file_name

    # Make the DELETE request with project_id and file_name as query parameters
    response = client.delete("/files/", params={"project_id": TEST_PROJECT_ID, "file_name": TEST_FILE_NAME})

    # Assert the response
    assert response.status_code == 200
    assert response.json() == {"message": "File deleted successfully!"}


def test_delete_file_failure():
    # Make the DELETE request with project_id and non-existing file_name as query parameters
    response = client.delete("/files/", params={"project_id": TEST_PROJECT_ID, "file_name": NON_EXISTING_FILE_NAME})

    # Assert the response
    assert response.status_code == 404  # Expecting a "File not found" error
    assert "detail" in response.json()
    assert response.json()["detail"] == "File not found in the database"
