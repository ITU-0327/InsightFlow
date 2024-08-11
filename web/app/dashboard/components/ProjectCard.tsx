// components/ProjectCard.tsx
import React from "react";
import BaseCard from "@/components/ui/card";
import { Project } from "@/models/Project";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <BaseCard className="mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {project?.title || "Project Title"}
      </h1>
      <p className="text-gray-700">
        {project?.description ||
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam perferendis aliquam minima error illum! Totam neque quis voluptas perspiciatis dolores quia et aperiam incidunt, itaque tempore fugiat nulla pariatur suscipit?"}
      </p>
    </BaseCard>
  );
};

export default ProjectCard;
