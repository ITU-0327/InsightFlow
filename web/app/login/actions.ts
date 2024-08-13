"use server";

import { createClient } from "@/utils/supabase/server";
import { permanentRedirect, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

type LoginData = {
  email: string;
  password: string;
};

export const handleLogin = async ({ email, password }: LoginData) => {
  let emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

  if (!emailPattern.test(email) || password.length < 8) {
    throw new Error("Invalid email or password");
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error(error);
  }

  revalidatePath("/dashboard", "layout");
  permanentRedirect("/dashboard");
};

export const signIn = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/dashboard");
};

export const signUp = async (formData: FormData) => {
  const origin = headers().get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/dashboard"); // remove email verification
};
