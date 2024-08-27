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
            "absolute left-1/2 top-24 transform -translate-x-1/2 sm:left-72 sm:top-[96px] h-48 w-48 sm:h-72 sm:w-72 animate-pop-blob rounded-sm bg-purple-300 p-8 opacity-55 mix-blend-multiply blur-3xl filter",
            className,
            secondBlobColor
          )}
        ></div>
        <div
          className={cn(
            "absolute left-1/2 top-0 transform -translate-x-1/2 sm:left-20 sm:-top-[96px] h-48 w-48 sm:h-72 sm:w-72 animate-pop-blob rounded-sm bg-blue-300 p-8 opacity-55 mix-blend-multiply blur-3xl filter"
          )}
        ></div>

        <div
          className={cn(
            "absolute left-1/2 top-64 transform -translate-x-1/2 sm:right-20 sm:top-96 h-48 w-48 sm:h-72 sm:w-72 animate-pop-blob rounded-sm bg-purple-300 p-8 opacity-55 mix-blend-multiply blur-3xl filter"
          )}
        ></div>
      </div>
    </div>
  );
}
