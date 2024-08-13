"use server";

import { useClientConfig } from "../hooks/use-config";
import { ProjectFile } from "./files.model";

const { backend } = useClientConfig();

export const getProjectFiles = async (
  project_id: string
): Promise<ProjectFile[]> => {
  try {
    // /api/projects/{project_id}/files/
    const response = await fetch(`${backend}/projects/${project_id}/files`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    const files = await response.json();

    return files.map((file: any) => ({
      fileName: file.file_name,
      fileUrl: file.file_url,
      createdDate: new Date(file.last_update_time),
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const deleteProjectFile = async (
  projectId: string,
  filename: string
): Promise<void> => {
  const response = await fetch(
    `${backend}/files/?project_id=${projectId}&file_name=${filename}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
};

export const downloadFile = async (projectId: string, fileName: string) => {
  try {
    const response = await fetch(
      `${backend}/projects/${projectId}/files/${fileName}/download/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Get the filename from the Content-Disposition header, if available
    const contentDisposition = response.headers.get("Content-Disposition");
    const suggestedFileName = contentDisposition
      ? contentDisposition.split("filename=")[1]
      : fileName;

    const blob = await response.blob();

    //Create a link element, trigger a download, and then remove the link element
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = suggestedFileName || fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return blob;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};
