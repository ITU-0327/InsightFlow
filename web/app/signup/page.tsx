"use client";

import RetroGrid from "@/components/magicui/retro-grid";
import SignupForm from "@/app/signup/signup-form";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

const Signup = () => {
    const router = useRouter();


    return (
        <div className="flex flex-col justify-center items-center w-full h-dvh relative">
            <RetroGrid/>
            <div
                className="z-10 bg-white flex flex-col border border-solid border-spacing-2 border-zinc-500 p-10 rounded-xl gap-5">
                <SignupForm />
                <Button onClick={() => router.push('/login')}>Log in</Button>
            </div>
        </div>
    );
};

export default Signup;
