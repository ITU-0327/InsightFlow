"use server";

import {createClient} from "@/utils/supabase/server";
import {permanentRedirect} from "next/navigation";
import {revalidatePath} from "next/cache";

type LoginData = {
    email: string;
    password: string;
}

export const handleLogin = async ({email, password}: LoginData) => {
    let emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

    if (!emailPattern.test(email) || password.length < 8) {
        throw new Error("Invalid email or password");
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })

    if (error) {
        console.error(error)
    }

    revalidatePath("/dashboard", "layout");
    permanentRedirect("/dashboard")
};