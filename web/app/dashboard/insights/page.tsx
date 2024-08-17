"use client";
import React, { useEffect, useState } from "react";
import { getProjects } from "../actions";
import { getProjectInsights } from "./actions";
import { InsightNote } from "./insight.model";
import NoteCard from "./components/NoteCard";
import { MasonryLayout } from "./components/MasonryLayout";
import { revalidatePath } from "next/cache";
import LoadingCard from "@/components/ui/card-loading";
import { useAuth } from "../hooks/use-auth";
import Image from "next/image";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [insightNotes, setInsightNotes] = useState<InsightNote[]>([]);

  async function fetchInsights() {
    setLoading(true);
    const auth = await useAuth();
    const projects = await getProjects(auth?.userId);
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
  if (insightNotes.length === 0 && !loading) {
    return (
      <Image
        src="/images/insights-placeholder.jpg"
        width={1000}
        height={900}
        alt="Picture of the author"
        className="mx-auto"
      />
    );
  }

  return (
    <div>
      {loading ? (
        <div className=" flex gap-2">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : (
        <MasonryLayout posts={insightNotes} />
      )}
    </div>
  );
};

export default Page;
