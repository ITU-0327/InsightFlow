"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Dropzone from "./components/Dropzone";
import { getProjects } from "./actions";
import { Project } from "@/models/Project";
import React from "react";

// Dynamically import the ProjectCard component with suspense
const ProjectCard = dynamic(() => import("./components/ProjectCard"), {
  suspense: true,
});

const Page = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchProjects();
  }, []);

  return (
    <div className="p-4 w-full">
      <React.Suspense
        fallback={
          <div className="w-full h-32 bg-gray-200 animate-pulse rounded-md"></div>
        }
      >
        {projects.length > 0 && <ProjectCard project={projects[0]} />}
      </React.Suspense>

      <Dropzone
        onDrop={(file) => {
          // Handle the file drop, e.g., upload the file or read its contents
          console.log(file);
          // TODO: Implement file upload or processing
        }}
        text="Drag & drop to update project description in .pdf here ..."
      />
    </div>
  );
};

export default Page;
