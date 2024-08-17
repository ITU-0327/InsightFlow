"use client";
import React, { useEffect, useState } from "react";
import { Persona, getPersonas } from "./actions";
import { getProjects } from "../actions";
import { useAuth } from "../hooks/use-auth";
import { ProjectTheme } from "../insights/themes/actions";
import PersonaBioCard from "./components/PersonaBioCard";

const page = () => {
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);

  async function fetchPersonas() {
    setLoading(true);
    const auth = await useAuth();
    const projects = await getProjects(auth?.userId);
    if (projects.length === 0) {
      console.log("No projects found");
      setLoading(false);
      return;
    }

    const projectId = projects[0].id!;
    const personas = await getPersonas(projectId);
    setPersonas(personas);
    setLoading(false);
  }

  useEffect(() => {
    fetchPersonas();
  }, []);
  return (
    <div>
      {personas.map((person) => (
        <PersonaBioCard
          name={person.name}
          keyNotes={person.key_notes}
          title={person.personaTitle}
        />
      ))}
    </div>
  );
};

export default page;
