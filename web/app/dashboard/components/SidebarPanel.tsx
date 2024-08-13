"use client";
import React, { useState } from "react";
import {
  IconArrowLeft,
  IconFolder,
  IconHome2,
  IconInfinity,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div>
        <IconInfinity className="mx-1 text-indigo-700" size={30} />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        <div className="flex items-center">
          <h1 className="mr-1 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-500 ">
            InsightFlow
          </h1>
          <IconSparkles className="text-purple-500 " />
        </div>
      </motion.span>
    </Link>
  );
};

export default function SidebarPanel() {
  const links = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: (
        <IconHome2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Files",
      href: "/dashboard/files",
      icon: (
        <IconFolder className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Insights",
      href: "/dashboard/insights",
      icon: (
        <IconSparkles className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  // TODO: GET project
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <>
            <Logo />
          </>
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                className={
                  pathname === link.href
                    ? "bg-zinc-200 rounded-md px-2"
                    : "bg-inherit px-2"
                }
              />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "Username",
              href: "#",
              icon: (
                <Image
                  src=""
                  className="h-7 w-7 flex-shrink-0 rounded-full"
                  width={50}
                  height={50}
                  alt="Avatar"
                />
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
