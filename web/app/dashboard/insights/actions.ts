"use server";

import { useClientConfig } from "../hooks/use-config";
import { InsightNote } from "./insight.model";

const { backend } = useClientConfig();

export const getProjectInsights = async (
  project_id: string
): Promise<InsightNote[]> => {
  try {
    // /api/projects/{project_id}/insights/docs
    const response = await fetch(
      `${backend}/projects/${project_id}/insights/docs`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((d: any) => ({
      note: d.note,
      tags: d.tags,
      fullText: JSON.parse(d._node_content).text,
      source: d.file_name,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const generateInsights = async (project_id: string) => {
  const response = await fetch(`${backend}/projects/${project_id}/ingest/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to start ingestion: ${response.statusText}`);
  }
};
