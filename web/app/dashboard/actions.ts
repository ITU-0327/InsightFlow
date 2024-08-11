"use server";

import { Project } from "@/models/Project";
import { useClientConfig } from "./hooks/use-config";

const { backend } = useClientConfig();

export const getProjects = async (
  user_id: string = "123"
): Promise<Project[]> => {
  try {
    const response = await fetch(`${backend}/users/${user_id}/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Adjust caching behavior based on your needs
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const projects: Project[] = await response.json();
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
