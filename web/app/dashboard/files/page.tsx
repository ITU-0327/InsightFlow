"use client";
import React, { useEffect, useState } from "react";
import { ProjectFile } from "./files.model";
import { getProjectFiles } from "./actions";
import { IconPdf } from "@tabler/icons-react";
import { getProjects } from "../actions";
import FileUploadComponent from "./components/FileUploadComponent";
import FileItemComponent from "./components/FIleItemComponent";
import LoadingCard from "@/components/ui/card-loading";

const Page = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);

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
      console.log(projectFiles);
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
    return <LoadingCard />;
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="w-full p-3 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <h2 className="text-md text-gray-700">
            Upload your files here to be used for analysis , can be in .pdf .csv{" "}
          </h2>
        </div>

        <FileUploadComponent
          projectId={projectId}
          onUploadSuccess={fetchFiles}
        />
      </div>

      {files.map((file, index) => (
        <FileItemComponent
          key={index}
          fileName={file.fileName}
          createdDate={file.createdDate.toDateString()}
          fileUrl={file.fileUrl}
          onDelete={() => {}}
        />
      ))}
    </div>
  );
};

export default Page;
