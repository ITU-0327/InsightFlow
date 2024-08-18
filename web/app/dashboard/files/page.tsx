"use client";
import React, { useEffect, useState } from "react";
import { ProjectFile } from "./files.model";
import { deleteProjectFile, getFileDownloadUrl, getProjectFiles } from "./actions";
import { getProjects } from "../actions";
import FileUploadComponent from "./components/FileUploadComponent";
import FileItemComponent from "./components/FIleItemComponent";
import LoadingCard from "@/components/ui/card-loading";
import { useAuth } from "../hooks/use-auth";

const Page = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const auth = await useAuth();
      const projects = await getProjects(auth?.userId);
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

  const handleDelete = async (fileName: string) => {
    try {
      await deleteProjectFile(projectId, fileName);
      await fetchFiles(); // Refresh the file list after deletion
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const downloadUrl = await getFileDownloadUrl(projectId, fileName);

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download file:", error);
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
          onDelete={() => handleDelete(file.fileName)}
          onDownload={() => handleDownload(file.fileName)}
        />
      ))}
    </div>
  );
};

export default Page;
