"use client";

import RetroGrid from "@/components/magicui/retro-grid";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";
import LoginForm from "@/app/login/login-form";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

const Login = ({
  searchParams,
}: {
  searchParams: { message: string };
}) => {
    const router = useRouter();

    return (
        <div className="flex flex-col justify-center items-center w-full h-dvh relative">
            <RetroGrid/>
            <div
                className="z-10 bg-white flex flex-col border border-solid border-spacing-2 border-zinc-500 p-10 rounded-xl gap-5">
                <LoginForm />
                <Button onClick={() => router.push('/signup')}>Sign up</Button>
            </div>
            {searchParams?.message && (
                <Alert variant="destructive" className="absolute bottom-5 right-5 w-auto">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {searchParams.message}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default Login;
