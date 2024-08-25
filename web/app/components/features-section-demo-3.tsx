import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "AI-Driven Insights Tagging",
      description:
        "Automatically extract, tag, and categorize crucial information, saving you hours of manual work",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-3 border-b lg:border-r dark:border-neutral-800",
    },

    {
      title: "Interactive AI Assistant",
      description:
        "Chat with the AI assistant to get quick answers and explore insights on your data",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r  dark:border-neutral-800",
    },

    {
      title: "Chat with your potential users",
      description: "Generate user segments and personas you can chat with",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-4 border-b lg:border-none",
    },
    {
      title: "Smart Clustering",
      description:
        "Identify emerging themes and automatically group similar insights",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
  ];
  return (
    <div
      className="relative z-20 py-20 lg:p-20 max-w-7xl mx-auto bg-gradient-to-b from-white via-neutral-100 to-transparent rounded-t-2xl "
      id="features"
    >
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Features
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-600 text-center font-normal dark:text-neutral-300">
          InsightFlow transforms user research into powerful insights. From
          automated summaries and tagging to AI-driven personas and instant data
          analysis, it’s all here. Engage with your data effortlessly and get
          the insights you need, <i>faster</i>.
        </p>
      </div>

      <div className="relative ">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 shadow-sm rounded-sm dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        `p-4 sm:p-8 relative overflow-hidden bg-gradient-to-tr from-white to-neutral-100 rounded-none`,
        className
      )}
    >
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-base md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 mt-1"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex h-full">
      <div className="relative w-full m-2" style={{ paddingBottom: "62.5%" }}>
        <Image
          src={"/images/insights-preview.png"}
          alt="insights preview"
          layout="fill"
          objectFit="cover"
          className="rounded-xl shadow-md p-4"
        />
      </div>
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex h-full">
      <div className="relative w-full m-2">
        <Image
          src={"/images/chat-preview.png"}
          alt="chat preview"
          height={700}
          width={700}
          objectFit="cover"
          className="rounded-xl shadow-md p-4"
        />
      </div>
    </div>
  );
};

export const SkeletonTwo = () => {
  return (
    <div className="relative flex h-full">
      <div className="relative w-full m-2">
        <Image
          src={"/images/clustering-preview.png"}
          alt="clustering preview"
          layout="fill"
          objectFit="cover"
          className="rounded-xl shadow-md p-4"
        />
      </div>
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
      <div className="relative w-full m-2">
        <Image
          src={"/images/persona-preview.png"}
          alt="persona preview"
          height={700}
          width={700}
          objectFit="cover"
          className="rounded-xl shadow-md p-4"
        />
      </div>
    </div>
  );
};
