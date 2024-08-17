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
export type Tag = "pain points" | "behaviour" | "demographics" | "goals";

export const getTagColour = (tag: Tag) => {
  const tagColourMap: Record<Tag, { bg: string; text: string }> = {
    "pain points": {
      bg: "bg-pink-200",
      text: "text-pink-800",
    },
    behaviour: {
      bg: "bg-blue-200",
      text: "text-blue-800",
    },
    demographics: {
      bg: "bg-green-200",
      text: "text-green-800",
    },
    goals: {
      bg: "bg-yellow-200",
      text: "text-yellow-800",
    },
  };
  return (
    tagColourMap[tag] || {
      bg: "bg-purple-100",
      text: "text-purple-800",
    }
  );
};
