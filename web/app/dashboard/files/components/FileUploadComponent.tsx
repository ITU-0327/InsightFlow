"use client";

import React, { useState } from "react";
import { uploadFile } from "../../upload-file-helpder";
import { IconCloudUpload } from "@tabler/icons-react";

export default function FileUploadComponent({
  projectId,
  onUploadSuccess,
}: {
  projectId: string;
  onUploadSuccess: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      await handleUpload();
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const result = await uploadFile(file, projectId);
        setUploadStatus(`File uploaded successfully! URL: ${result}`);
        onUploadSuccess();
      } catch (error) {
        console.log(error);
        setUploadStatus("Failed to upload file.");
      }
    }
  };

  return (
    <div>
      <label className="flex bg-gray-800 hover:bg-gray-700 text-white text-base px-5 py-3 outline-none rounded w-max cursor-pointer mx-auto font-[sans-serif]">
        <IconCloudUpload className="mr-2" />
        Upload File
        <input
          type="file"
          id="uploadFile1"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
