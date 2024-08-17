"use server";

import { useClientConfig } from "../../hooks/use-config";
import { InsightNote } from "../insight.model";

const { backend } = useClientConfig();
export interface ProjectTheme {
  theme: string;
  notes: InsightNote[];
}
export const getProjectThemes = async (
  project_id: string
): Promise<ProjectTheme[]> => {
  try {
    // /api/projects/{project_id}/insights/docs
    const response = await fetch(`${backend}/projects/${project_id}/themes/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    const data = await response.json();
    const themes: ProjectTheme[] = [];
    Object.entries(data).forEach(([key, value]) => {
      const themeData = value as any;
      themes.push({
        theme: key,
        notes: themeData.data.map((d: any) => ({
          note: d.note,
          tags: d.tags,
          fullText: d.text_content,
          source: d.file_name,
        })),
      });
    });

    return themes;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
