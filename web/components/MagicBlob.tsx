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
            "absolute left-72 top-[96px] h-72 w-72 animate-pop-blob rounded-sm bg-purple-200 p-8 opacity-55 mix-blend-multiply blur-3xl filter",
            className,
            secondBlobColor
          )}
        ></div>
        <div
          className={cn(
            "absolute left-20 -top-[96px] h-72 w-72 animate-pop-blob rounded-sm bg-blue-200 p-8 opacity-55 mix-blend-multiply blur-3xl filter"
          )}
        ></div>

        <div
          className={cn(
            "absolute  right-20 top-96 h-72 w-72 animate-pop-blob rounded-sm bg-purple-300 p-8 opacity-55 mix-blend-multiply blur-3xl filter"
          )}
        ></div>
      </div>
    </div>
  );
}
