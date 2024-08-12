"use client";
import { IconCloudUpload, IconFile } from "@tabler/icons-react";
import React from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";

interface DropzoneProps extends DropzoneOptions {
  onDrop: (acceptedFiles: File[]) => void;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

const Dropzone: React.FC<DropzoneProps> = ({
  onDrop,
  text,
  className,
  children,
  ...dropzoneOptions
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    ...dropzoneOptions,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer ${className}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <>
          <IconFile className="mr-2 text-gray-600" />
          <p className="text-gray-600">Drop the files here ...</p>
        </>
      ) : (
        children || (
          <>
            <IconCloudUpload className="mr-2 text-gray-600" />
            <p className="text-gray-600">
              {text || "Drag & drop files here, or click to select files"}
            </p>
          </>
        )
      )}
    </div>
  );
};

export default Dropzone;
