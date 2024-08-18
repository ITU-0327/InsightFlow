"use client";
import {
  BellIcon,
  CalendarIcon,
  ChatBubbleIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";

import { BentoCard } from "@/components/magicui/bento-grid";

const features = [
  {
    Icon: InputIcon,
    name: "Generate insights instantly",
    description: "Automatically organise and tag your notes with AI",
    href: "/dashboard/insights",
    cta: "Explore",
    background: (
      <Image
        src="/images/insights-preview.png"
        width={500}
        height={100}
        alt="insights preview"
        className="mx-auto"
      />
    ),
  },

  {
    Icon: ChatBubbleIcon,
    name: "Chat with your user",
    description: "Generate user personas that you can chat with !",
    href: "/dashboard/personas",
    cta: "Explore",
    background: (
      <Image
        src="/images/user-persona-preview.png"
        width={300}
        height={100}
        alt="persona preview"
        className="mx-auto mt-4"
      />
    ),
  },
];

export function BentoGridPreview() {
  return (
    <div className="flex py-3 mt-7 b-0 gap-3 w-full justify-between">
      {features.map((feature) => (
        <BentoCard
          key={feature.name}
          {...feature}
          className="w-full h-[450px]"
        />
      ))}
    </div>
  );
}
