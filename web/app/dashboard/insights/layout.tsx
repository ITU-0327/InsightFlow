import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      Header
      <div>{children}</div>
    </div>
  );
}
