import { cn } from "@/lib/utils";
interface BlobProps extends React.HTMLAttributes<HTMLDivElement> {
  firstBlobColor?: string;
  secondBlobColor?: string;
}

export default function MagicBlob({
  className,
  firstBlobColor,
  secondBlobColor,
}: BlobProps) {
  return (
    <div className="min-h-52 min-w-52 items-center justify-center absolute -z-10">
      <div className="relative w-full max-w-lg">
        <div
          className={cn(
            "absolute -left-4 -top-58 h-72 w-72 animate-pop-blob rounded-sm bg-blue-500 p-8 opacity-55 mix-blend-multiply blur-3xl filter",
            className,
            firstBlobColor
          )}
        ></div>
        <div
          className={cn(
            "absolute left-60 -top-44 h-72 w-72 animate-pop-blob rounded-sm bg-purple-400 p-8 opacity-55 mix-blend-multiply blur-3xl filter",
            className,
            secondBlobColor
          )}
        ></div>
        <div
          className={cn(
            "absolute left-20 -top-14 h-72 w-72 animate-pop-blob rounded-sm bg-purple-300 p-8 opacity-55 mix-blend-multiply blur-3xl filter"
          )}
        ></div>

        <div
          className={cn(
            "absolute left-40 -top-54 h-72 w-72 animate-pop-blob rounded-sm bg-indigo-400 p-8 opacity-55 mix-blend-multiply blur-3xl filter",
            className,
            secondBlobColor
          )}
        ></div>
        <div
          className={cn(
            "absolute left-32 top-4 h-72 w-72 animate-pop-blob rounded-sm bg-purple-300 p-8 opacity-55 mix-blend-multiply blur-3xl filter"
          )}
        ></div>
        <div
          className={cn(
            "absolute  right-20 top-28 h-72 w-72 animate-pop-blob rounded-sm bg-purple-300 p-8 opacity-55 mix-blend-multiply blur-3xl filter"
          )}
        ></div>
      </div>
    </div>
  );
}
