import { InsightNote } from "../insight.model";
import NoteCard from "./NoteCard";

interface MasonryLayoutProps {
  posts: InsightNote[];
}

export const MasonryLayout: React.FC<MasonryLayoutProps> = ({ posts }) => {
  // Initialize columns array with type InsightNote[][]
  const columns: InsightNote[][] = [[], [], [], []];

  // Distribute posts into columns
  posts.forEach((post, index) => {
    columns[index % 4].push(post);
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-1">
          {column.map((post) => (
            <NoteCard note={post} />
          ))}
        </div>
      ))}
    </div>
  );
};
