"use client";

import React, {type ComponentProps} from "react";
import Image from "next/image";

type Props = ComponentProps<"button"> & {
    provider: string;
    handleClick: () => void;
};

const SocialLoginButton = ({provider, handleClick}: Props) => {
    return (
        <button
            className="z-10 shadow-[inset_0_0_0_2px_#616467] text-black rounded-full tracking-widest uppercase font-bold bg-transparent hover:bg-[#616467] hover:text-white dark:text-neutral-200 transition duration-200 w-full flex flex-row items-center px-5 py-2.5 gap-5"
            onClick={handleClick}>
            <Image
                src={`/icons/${provider.toLowerCase()}-icon.svg`}
                width={24}
                height={24}
                alt={`${provider.toLowerCase()}-icon`}
            />
            <span className="z-10 text-center w-full">{`Login in ${provider}`}</span>
        </button>
    );
}

export default SocialLoginButton;