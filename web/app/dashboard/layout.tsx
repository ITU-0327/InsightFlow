import { cn } from "@/lib/utils";
import SidebarPanel from "./components/SidebarPanel";
import { ReactNode } from "react";
import { useAuth } from "@/app/dashboard/hooks/use-auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: ReactNode }) {
  const auth = await useAuth();

  // If the user is not authenticated, they would be redirected to the login page by useAuth
  if (!auth) {
    return null;
  }

  const { email } = auth;

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-[60vh]" // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <SidebarPanel userEmail={email!} />
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
