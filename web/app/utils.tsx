import {
  IconFileText,
  IconFile,
  IconFileTypePdf,
  IconFileTypeDocx,
  IconFileTypeDoc,
  IconFileTypeCsv,
} from "@tabler/icons-react";

export const getFileType = (fileName: string): string => {
  // Extract the file extension from the file name
  const fileExtension = fileName
    .substring(fileName.lastIndexOf(".") + 1)
    .toLowerCase();
  return fileExtension || "";
};

export const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <IconFileTypePdf />;
    case "doc":
      return <IconFileTypeDoc />;
    case "docx":
      return <IconFileTypeDocx />;
    case "txt":
      return <IconFileText />;
    case "csv":
      return <IconFileTypeCsv />;
    default:
      return <IconFile />;
  }
};
