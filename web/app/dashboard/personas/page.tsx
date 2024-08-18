"use client";
import React, { useEffect, useState } from "react";
import { Persona, getPersonas } from "./actions";
import { getProjects } from "../actions";
import { useAuth } from "../hooks/use-auth";
import PersonaBioCard from "./components/PersonaBioCard";
import Image from "next/image";
import { Icon3dCubeSphere } from "@tabler/icons-react";
import { getTagColour } from "@/app/utils";
import PersonaDetailsCard from "./components/PersonaDetailsCard";
import { ChatBox } from "../insights/ask/Chatbox";
import { ragChatAction } from "../insights/actions";
import LoadingCard from "@/components/ui/card-loading";

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
  if (loading)
    return (
      <>
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </>
    );
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
      <div className="flex mt-5 gap-10 justify-start items-center">
        {selectedPersona ? (
          <>
            <PersonaDetailsCard
              persona={selectedPersona}
              personaImage={personaImage}
            />
            <div className="max-w-[600px] w-full mt-5">
              <ChatBox onSend={ragChatAction} className="h-[650px]" />
            </div>
          </>
        ) : (
          <Image
            src="/images/user-persona-preview.png"
            width={300}
            height={100}
            alt="persona preview"
            className="m-auto mt-4"
          />
        )}
      </div>
    </div>
  );
};

export default Page;
