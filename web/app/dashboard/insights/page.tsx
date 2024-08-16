"use client";
import React, { useEffect, useState } from "react";
import { getProjects } from "../actions";
import { getProjectInsights } from "./actions";
import { InsightNote } from "./insight.model";
import NoteCard from "./components/NoteCard";
import { MasonryLayout } from "./components/MasonryLayout";
import { revalidatePath } from "next/cache";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [insightNotes, setInsightNotes] = useState<InsightNote[]>([]);

  async function fetchInsights() {
    setLoading(true);
    const projects = await getProjects();
    if (projects.length === 0) {
      console.log("No projects found");
      setLoading(false);
      return;
    }

    const projectId = projects[0].id!;
    const notes = await getProjectInsights(projectId);
    setInsightNotes(notes);
    setLoading(false);
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div>
      {loading ? <p>Loading...</p> : <MasonryLayout posts={insightNotes} />}
    </div>
  );
};

export default Page;
