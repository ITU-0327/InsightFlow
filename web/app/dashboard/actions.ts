"use server";

import { Project } from "@/models/Project";
import { useClientConfig } from "./hooks/use-config";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const logOut = async (): Promise<void> => {
  "use server";
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
};
export const getProjects = async (
  user_id: string = "USER_ID_NOT_PROVIDED"
): Promise<Project[]> => {
  const { backend } = useClientConfig();
  try {
    const response = await fetch(`${backend}/users/${user_id}/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const projects: Project[] = await response.json();
    return projects;
  } catch (error) {
    console.error("Error fetching projects for user:", user_id, error);
    throw error;
  }
};
