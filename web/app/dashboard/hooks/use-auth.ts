"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const useAuth = async (): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(user);
  if (!user) {
    return redirect("/login");
  }
};
