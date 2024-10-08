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
        "Cache-Control": "force-cache",
      },
      cache: "force-cache",
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

export const getFileDownloadUrl = async (
  projectId: string,
  fileName: string
) => {
  return `${backend}/projects/${projectId}/files/${fileName}/download/`;
};
