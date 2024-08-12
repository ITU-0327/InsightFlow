"use server";

import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";

export const useAuth = async (): Promise<void> => {
    const supabase = createClient();

    const {data: {session}} = await supabase.auth.getSession();

    if (!session || !session.user) {
        return redirect("/login");
    }
}