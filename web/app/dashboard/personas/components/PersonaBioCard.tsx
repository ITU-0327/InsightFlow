import BaseCard from "@/components/ui/card";
import React from "react";

type PersonaBioCardProps = {
  name: string;
  keyNotes: string;
  title: string;
};

const PersonaBioCard: React.FC<PersonaBioCardProps> = ({
  name,
  keyNotes,
  title,
}) => {
  return (
    <BaseCard>
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-gray-700">{keyNotes}</p>
    </BaseCard>
  );
};

export default PersonaBioCard;
