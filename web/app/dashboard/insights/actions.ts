"use server";

import { useClientConfig } from "../hooks/use-config";
import { ChatResponse } from "./ask/ChatResponse.model";
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
export async function ragChatAction(
  projectId: string,
  query: string,
  filters: Record<string, string> | null = null
) {
  const { backend } = useClientConfig();
  try {
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `${backend}/projects/${projectId}/rag_chat/?query=${encodedQuery}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        //   body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();

    const chatResponse: ChatResponse = {
      metadata: data.metadata,
      response: data.response,
    };
    return chatResponse;
  } catch (error) {
    console.error("Error in ragChatAction:", error);
    throw error;
  }
}
