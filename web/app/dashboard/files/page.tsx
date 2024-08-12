"use client";
import React, { useEffect, useState } from "react";
import { ProjectFile } from "./files.model";
import { getProjectFiles } from "./actions";
import { IconPdf } from "@tabler/icons-react";
import { getProjects } from "../actions";

const Page = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const projects = await getProjects();
      if (!projects[0]) return;
      const projectId = projects[0].id!;
      const projectFiles = await getProjectFiles(projectId);
      setFiles(projectFiles);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);
  return (
    <div>
      <IconPdf />
      Page
    </div>
  );
};

export default Page;
