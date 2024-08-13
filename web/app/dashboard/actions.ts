"use server";

import { Project } from "@/models/Project";
import { useClientConfig } from "./hooks/use-config";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const { backend } = useClientConfig();
export const logOut = async (): Promise<void> => {
  "use server";
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
};
export const getProjects = async (
  user_id: string = "123"
): Promise<Project[]> => {
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
    console.error("Error fetching projects:", error);
    throw error;
  }
};
