import React from "react";
import { Persona } from "../actions";
import { getTagColour } from "@/app/utils";
import Image from "next/image";
const PersonaDetailsCard = ({
  personaImage,
  persona,
}: {
  personaImage: string;
  persona: Persona;
}) => {
  return (
    <div className="mt-4 p-5 bg-white rounded-md border shadow-lg w-[700px]">
      <div className="flex gap-2 pb-3 border-b">
        <Image height={70} width={70} alt="profile" src={personaImage} />
        <div>
          <h2 className="text-xlg font-bold">{persona.name}</h2>
          <p className="text-sm text-gray-500">{persona.personaTitle}</p>
          <p className="text-sm text-gray-500">{persona.demographics}</p>
        </div>
      </div>
      <p className="font-bold text-md">Bio</p>
      <p className="text-gray-700 mb-5">{persona.key_notes}</p>
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 pr-4 border-r border-gray-300">
          <p
            className={`font-bold text-md p-2 rounded mb-3 ${
              getTagColour("pain points").bg
            } ${getTagColour("pain points").text}`}
          >
            Pain Points
          </p>
          <p className="text-gray-700">{persona.painPoints}</p>
        </div>
        <div className="w-full md:w-1/2 pl-4">
          <p
            className={`font-bold text-md p-2 rounded mb-3 ${
              getTagColour("goals").bg
            } ${getTagColour("goals").text}`}
          >
            Goals
          </p>
          <p className="text-gray-700">{persona.goals}</p>
        </div>
      </div>

      <div className="flex flex-wrap mt-4">
        <div className="w-full md:w-1/2 pr-4 border-r border-gray-300">
          <p
            className={`font-bold text-md p-2 rounded mb-3 ${
              getTagColour("behaviour").bg
            } ${getTagColour("behaviour").text}`}
          >
            Behavior
          </p>
          <p className="text-gray-700">{persona.behavior}</p>
        </div>
        <div className="w-full md:w-1/2 pl-4">
          <p
            className={`font-bold text-md p-2 rounded mb-3 ${
              getTagColour("motivations").bg
            } ${getTagColour("motivations").text}`}
          >
            Motivations
          </p>
          <p className="text-gray-700">{persona.motivations}</p>
        </div>
      </div>

      {/* Add more fields as needed */}
    </div>
  );
};

export default PersonaDetailsCard;
