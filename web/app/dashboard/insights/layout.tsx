import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import SegmentedControl from "./components/SegmentedControl";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="mb-3">
        <SegmentedControl />
      </div>

      <div>{children}</div>
    </div>
  );
}
