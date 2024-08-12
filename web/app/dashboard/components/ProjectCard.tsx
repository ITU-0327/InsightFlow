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
        {project?.title || "Project has not been created yet"}
      </h1>
      <p className="text-gray-700">
        {project?.description ||
          "upload a project background below ⬇️ from your notes and this description will be summarised by AI"}
      </p>
    </BaseCard>
  );
};

export default ProjectCard;
