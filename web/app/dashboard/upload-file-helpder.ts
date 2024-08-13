import { useClientConfig } from "./hooks/use-config";

export const uploadFile = async (file: File, projectId: string) => {
  try {
    const { backend } = useClientConfig();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `http://localhost:8000/api/projects/${projectId}/files/`, // TODO: dont know how to hide this thing
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
