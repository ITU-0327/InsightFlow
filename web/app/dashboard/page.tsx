"use client";
import { useEffect, useState } from "react";
import BaseCard from "@/components/ui/card";
import Dropzone from "./components/Dropzone";
import { Project } from "next/dist/build/swc";
import { getProjects } from "./actions";

const Page = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Replace with your API call
        const projects = getProjects();
        setProjects(projects[0]);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 w-full">
      <BaseCard className="mb-6">
        <h1 className="text-2xl font-bold mb-4">
          {project?.name || "Project Name"}
        </h1>
        <p className="text-gray-700">
          {project?.description ||
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam perferendis aliquam minima error illum! Totam neque quis voluptas perspiciatis dolores quia et aperiam incidunt, itaque tempore fugiat nulla pariatur suscipit?"}
        </p>
      </BaseCard>

      <Dropzone
        onDrop={(file) => {
          // Handle the file drop, e.g., upload the file or read its contents
          console.log(file);
          // TODO: Implement file upload or processing
        }}
        text="Drag & drop to upload project description in .pdf here ..."
      />
    </div>
  );
};

export default Page;
