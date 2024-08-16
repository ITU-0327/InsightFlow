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
export const createProject = async (file: File, userId: string): Promise<void> => {
  const { backend } = useClientConfig();
  console.log("Backend URL:", backend);
  try {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);

    const response = await fetch(`${backend}/projects`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};
