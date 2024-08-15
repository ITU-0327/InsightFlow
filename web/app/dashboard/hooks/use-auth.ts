"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface AuthData {
  userId: string;
  email: string | undefined;
}

export const useAuth = async (): Promise<AuthData | void> => {
  const supabase = createClient();

  // Get the authenticated user
  const { data } = await supabase.auth.getUser();

  const user = data.user;

  // If no user is authenticated, redirect to the login page
  if (!user) {
    redirect("/login");
    return;
  }

  // Return user ID, email, and the logout function
  return {
    userId: user.id,
    email: user.email,
  };
};
