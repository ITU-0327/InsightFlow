import BaseCard from "@/components/ui/card";
import { IconCloudUpload, IconUpload } from "@tabler/icons-react";

const Page = () => {
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

      {/* Dropzone */}
      <div className="w-full p-6 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center">
        <IconCloudUpload className="text-gray-600 mr-3" />
        <p className="text-gray-600">
          Drag & drop project description in .pdf here
        </p>
      </div>
    </div>
  );
};

export default Page;
