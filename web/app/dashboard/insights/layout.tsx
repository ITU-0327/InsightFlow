import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import SegmentedControl from "./components/SegmentedControl";
import GenerateInsightsButton from "./components/GenerateInsightsButton";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex justify-between items-center">
        <SegmentedControl />
        <GenerateInsightsButton />
      </div>

      <div>{children}</div>
    </div>
  );
}
