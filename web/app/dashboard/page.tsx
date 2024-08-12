"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Dropzone from "./components/Dropzone";
import { getProjects } from "./actions";
import { Project } from "@/models/Project";
import React from "react";
import LoadingCard from "@/components/ui/card-loading";

// Dynamically import the ProjectCard component with suspense
const ProjectCard = dynamic(() => import("./components/ProjectCard"), {
  suspense: true,
});

const Page = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fetchProjects = async () => {
    try {
      const userProjects = await getProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFileDrop = async (file: File) => {
    if (!projects[0]) return; // Ensure there's a project to update

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const projectId = projects[0].id;
      const response = await fetch(
        `http://localhost:8000/api/projects/${projectId}/files/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        console.log("File uploaded successfully");
        // Optionally, you could refetch the project or update its state
      } else {
        console.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 w-full">
      {loading ? (
        <LoadingCard className="mb-6" />
      ) : (
        projects[0] && <ProjectCard project={projects[0]} />
      )}

      <Dropzone
        onDrop={(files) => {
          if (files && files[0]) {
            handleFileDrop(files[0]);
          }
        }}
        text={
          uploading
            ? "Uploading..."
            : "Drag & drop to update project description in .pdf here ..."
        }
        disabled={uploading} // Disable dropzone during upload
      />
    </div>
  );
};

export default Page;
