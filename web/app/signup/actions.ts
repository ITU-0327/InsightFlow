"use server";

import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";

type SignupData = {
    email: string;
    password: string;
}

export const handleSignup = async ({email, password}: SignupData) => {
    let emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

    if (!emailPattern.test(email) || password.length < 8) {
        throw new Error("Invalid email or password");
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
    })

    if (error) {
        console.error(error)
    }

    revalidatePath("/dashboard", "layout");
    redirect("/dashboard")
};