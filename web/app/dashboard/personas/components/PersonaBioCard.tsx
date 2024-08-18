import BaseCard from "@/components/ui/card";
import Image from "next/image";
import React, { useMemo } from "react";

type PersonaBioCardProps = {
  id: string;
  name: string;
  title: string;
  selected: boolean;
  onSelected: (imagePath: string, id: string) => void;
};

const PersonaBioCard: React.FC<PersonaBioCardProps> = ({
  id,
  name,
  title,
  selected,
  onSelected,
}) => {
  // Function to get a random image for the persona
  const getRandomPersonaPic = () => {
    const images = [
      "/images/peep_1.svg",
      "/images/peep_2.svg",
      "/images/peep_3.svg",
      "/images/peep_4.svg",
      "/images/peep_5.svg",
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const imagePath = useMemo(() => getRandomPersonaPic(), []);

  const handleSelect = () => {
    onSelected(imagePath, id);
  };

  return (
    <div onClick={handleSelect}>
      <BaseCard
        className={`flex gap-2 justify-between cursor-pointer h-full items-center max-w-[300px] ${
          selected ? "border-2 border-purple-500 bg-purple-50" : ""
        }`}
      >
        <Image height={80} width={80} alt="profile" src={imagePath} />
        <div>
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </BaseCard>
    </div>
  );
};

export default PersonaBioCard;
