import { useClientConfig } from "./hooks/use-config";

export const uploadFile = async (file: File, projectId: string) => {
  try {
    const { backend } = useClientConfig();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${backend}/projects/${projectId}/files/`, // TODO: dont know how to hide this thing
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      console.log("File uploaded successfully");
      // Optionally, you could refetch the project or update its state
    } else {
      console.error("Failed to upload file");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
export const upsertProject = async (
    file: File,
    userId: string,
    projectId?: string | null // Optional project ID for updating
): Promise<string | null> => {
  const { backend } = useClientConfig();
  console.log("Backend URL:", backend);
  try {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);

    if (projectId) {
      formData.append("project_id", projectId); // Include project ID if updating
    }

    const response = await fetch(`${backend}/projects`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const returnedProjectId = data.data[0]?.id || projectId;  // Use returned ID or existing one
      console.log(
          projectId
              ? `Project updated successfully with ID: ${returnedProjectId}`
              : `Project created successfully with ID: ${returnedProjectId}`
      );
      return returnedProjectId;
    } else {
      throw new Error(`Failed to upsert project: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error upserting project:", error);
    return null;
  }
};
