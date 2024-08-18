"use client";
import React, { useEffect, useState } from "react";
import { Persona, getPersonas } from "./actions";
import { getProjects } from "../actions";
import { useAuth } from "../hooks/use-auth";
import PersonaBioCard from "./components/PersonaBioCard";
import Image from "next/image";
import { Icon3dCubeSphere } from "@tabler/icons-react";

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [personaImage, setPersonaImage] = useState<string>("");

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

  const handleSelectPersona = (image: string, id: string) => {
    const persona = personas.find((p) => p.personaId === id) || null;
    setSelectedPersona(persona);
    setPersonaImage(image);
  };

  return (
    <div>
      <div className="flex gap-2">
        {personas.map((person) => (
          <PersonaBioCard
            key={person.personaId}
            name={person.name}
            id={person.personaId}
            title={person.personaTitle}
            selected={person.personaId === selectedPersona?.personaId}
            onSelected={handleSelectPersona}
          />
        ))}
      </div>
      <div className="flex">
        {/* <ChatWindow */}
        <div className="border">chat window</div>
        {selectedPersona && (
          <div className="mt-4 p-4 bg-white rounded shadow-lg w-[500px]">
            <Image height={100} width={100} alt="profile" src={personaImage} />
            <h2 className="text-xl font-bold">{selectedPersona.name}</h2>
            <p className="text-md text-gray-500">
              {selectedPersona.personaTitle}
            </p>
            <p className="mt-2 text-gray-700">{selectedPersona.key_notes}</p>
            <p className="mt-2 text-gray-700">{selectedPersona.painPoints}</p>
            <p className="mt-2 text-gray-700">{selectedPersona.behavior}</p>
            <p className="mt-2 text-gray-700">{selectedPersona.goals}</p>
            <p className="mt-2 text-gray-700">{selectedPersona.motivations}</p>
            {/* Add more fields as needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
