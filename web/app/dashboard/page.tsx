"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Dropzone from "./components/Dropzone";
import { getProjects } from "./actions";
import { Project } from "@/models/Project";
import React from "react";
import LoadingCard from "@/components/ui/card-loading";
import {uploadFile, upsertProject} from "./upload-file-helpder";
import { useAuth } from "./hooks/use-auth";

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
      const auth = await useAuth();
      const userProjects = await getProjects(auth?.userId);

      console.log("Fetched projects:", userProjects);
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
    setUploading(true);
    try {
      const auth = await useAuth(); // Get the user_id
      const userId = auth?.userId;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Determine if there is an existing project
      let projectId = projects.length > 0 ? projects[0]?.id : null;

      // Upsert the project (create or update)
      projectId = await upsertProject(file, userId, projectId);

      if (projectId) {
        console.log(`${projects.length === 0 ? "New project created" : "Project updated"} with ID:`, projectId);

        // Upload the file to the project
        await uploadFile(file, projectId);
        console.log("File uploaded to project:", projectId);

        // Refresh the project list after creating or updating a project
        await fetchProjects();
      } else {
        console.error("Failed to upsert project. File upload skipped.");
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
      ) : projects.length > 0 ? (
        <ProjectCard project={projects[0]} />
      ) : (
        <div className="mb-6 p-4 bg-white shadow rounded">
          <p>No projects found. Upload a project description to create one.</p>
        </div>
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
              : projects.length === 0
              ? "Drag & drop to upload project description and create a new project..."
              : "Drag & drop to update project description..."
        }
        disabled={uploading} // Disable dropzone during upload
      />
    </div>
  );
};

export default Page;
