"use client";
import React, { useEffect, useState } from "react";
import { ProjectFile } from "./files.model";
import { getProjectFiles } from "./actions";
import { IconPdf } from "@tabler/icons-react";
import { getProjects } from "../actions";
import FileUploadComponent from "../components/FileUploadComponent";

const Page = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const projects = await getProjects();
      if (projects.length === 0) {
        console.log("No projects found");
        setLoading(false);
        return;
      }

      const newProjectId = projects[0].id!;
      setProjectId(newProjectId);

      const projectFiles = await getProjectFiles(newProjectId);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <IconPdf />
      {files.length > 0 ? files[0].fileUrl : "No files found"}
      <FileUploadComponent projectId={projectId} />
    </div>
  );
};

export default Page;
