"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Dropzone from "./components/Dropzone";
import { getProjects } from "./actions";
import { Project } from "@/models/Project";
import React from "react";
import LoadingCard from "@/components/ui/card-loading";
import { uploadFile, createProject } from "./upload-file-helpder";
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

      if (projects.length === 0) {
        // Create a new project by uploading the project description
        const projectId = await createProject(file, userId);

        if (projectId) {
          // Step 2: Upload the file to the created project
          await uploadFile(file, projectId);
          console.log("File uploaded to project:", projectId);
        } else {
          console.error("Failed to create project. File upload skipped.");
        }
      } else {
        // Update existing project with a new description
        await uploadFile(file, projects[0].id!);
      }
      // Refresh the project list after creating or updating a project
      await fetchProjects();
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
