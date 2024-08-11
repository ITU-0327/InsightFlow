"use client";
import BaseCard from "@/components/ui/card";
import Dropzone from "./components/Dropzone";

const Page = () => {
  // TODO: GET project
  return (
    <div className="p-4 w-full">
      <BaseCard className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Project Name</h1>
        <p className="text-gray-700">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam
          perferendis aliquam minima error illum! Totam neque quis voluptas
          perspiciatis dolores quia et aperiam incidunt, itaque tempore fugiat
          nulla pariatur suscipit?
        </p>
      </BaseCard>

      <Dropzone
        onDrop={(file) => console.log(file)}
        text="Drag & drop to upload project description in .pdf here ..."
      />
    </div>
  );
};

export default Page;
