"use client";

import React, { useState } from "react";
import { uploadFile } from "../upload-file-helpder";

export default function FileUploadComponent({
  projectId,
}: {
  projectId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const result = await uploadFile(file, projectId);
        setUploadStatus(`File uploaded successfully! URL: ${result}`);
      } catch (error) {
        console.log(error);
        setUploadStatus("Failed to upload file.");
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
      <p>{uploadStatus}</p>
    </div>
  );
}
