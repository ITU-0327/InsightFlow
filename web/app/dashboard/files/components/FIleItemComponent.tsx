import React from "react";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { getFileIcon, getFileType } from "@/app/utils";

interface FileItemProps {
  fileName: string;
  createdDate: string;
  fileUrl: string;
  onDelete: (fileName: string) => void;
}

const FileItemComponent: React.FC<FileItemProps> = ({
  fileName,
  createdDate,
  fileUrl,
  onDelete,
}) => {
  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  const handleDelete = () => {
    onDelete(fileName);
  };

  const fileType = getFileType(fileName);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow m-3">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          {/* Placeholder icon, adjust as needed */}
          {getFileIcon(fileType)}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{fileName}</span>
          <span className="text-sm text-gray-500">
            {new Date(createdDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 space-x-2">
        <button onClick={handleDownload} className="text-gray">
          <IconDownload className="w-5 h-5" />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800"
        >
          <IconTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FileItemComponent;
