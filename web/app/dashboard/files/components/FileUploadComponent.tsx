"use client";

import React, { useState } from "react";
import { IconCloudUpload, IconLoader } from "@tabler/icons-react";
import { uploadFile } from "../../upload-file-helpder";

export default function FileUploadComponent({
  projectId,
  onUploadSuccess,
}: {
  projectId: string;
  onUploadSuccess: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
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
      setUploading(true);
      try {
        const result = await uploadFile(file, projectId);
        setUploadStatus(`File uploaded successfully! URL: ${result}`);
        onUploadSuccess();
      } catch (error) {
        console.log(error);
        setUploadStatus("Failed to upload file.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div>
      <label className="flex items-center bg-gray-800 hover:bg-gray-700 text-white text-base px-5 py-3 outline-none rounded w-max cursor-pointer font-[sans-serif]">
        {uploading ? (
          <IconLoader className="animate-spin mr-2" />
        ) : (
          <IconCloudUpload className="mr-2" />
        )}
        {uploading ? "Uploading..." : "Upload File"}
        <input
          type="file"
          id="uploadFile"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
