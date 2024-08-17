"use client";
import React, { useEffect, useState } from "react";
import { getProjects } from "../../actions";
import { useAuth } from "../../hooks/use-auth";

import { InsightNote } from "../insight.model";
import { ProjectTheme, getProjectThemes } from "./actions";
import ThemeAccordion from "./components/ThemeAccordion";

const page = () => {
  const [loading, setLoading] = useState(false);
  const [insightThemes, setInsightThemes] = useState<ProjectTheme[]>([]);

  async function fetchThemes() {
    setLoading(true);
    const auth = await useAuth();
    const projects = await getProjects(auth?.userId);
    if (projects.length === 0) {
      console.log("No projects found");
      setLoading(false);
      return;
    }

    const projectId = projects[0].id!;
    const themes = await getProjectThemes(projectId);
    const sortedThemes = themes.sort((a, b) => b.notes.length - a.notes.length);
    setInsightThemes(sortedThemes);
    setLoading(false);
  }

  useEffect(() => {
    fetchThemes();
  }, []);

  return (
    <div>
      {insightThemes.map((theme, index) => (
        <ThemeAccordion
          key={theme.theme}
          theme={theme.theme}
          notes={theme.notes}
        />
      ))}
    </div>
  );
};

export default page;
