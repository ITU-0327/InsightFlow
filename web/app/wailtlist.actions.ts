"use server"; // Server action directive

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
export async function handleWaitlistSubmission(email: string, ip: string) {
  const { data, error } = await supabase
    .from("waitlist")
    .insert([{ email, ip_address: ip }]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/waitlist");
}
