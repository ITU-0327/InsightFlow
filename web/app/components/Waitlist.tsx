"use client";

import MagicBlob from "@/components/MagicBlob";
import ShinyButton from "@/components/ShinyButton";
import Logo from "@/components/ui/logo";
import React, { FormEvent, useState } from "react";
import { handleWaitlistSubmission } from "../wailtlist.actions";
import { ConfettiButton } from "@/components/magicui/confetti";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = async (data: FormData) => {
    const ipres = await fetch("/api/get-ip").then((res) => res.json());
    const email = data.get("email") as string;

    try {
      await handleWaitlistSubmission(email, ipres.ip);
      setShowConfetti(true); // Show confetti after successful submission
      setEmail(""); // Clear the form
      setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
    } catch (error) {
      console.error("Failed to submit to the waitlist", error);
    }
  };

  return (
    <div className="relative h-screen" id="waitlist">
      <MagicBlob />
      <div className="flex flex-col items-center h-full justify-center max-w-xl text-center">
        <h2 className="text-5xl md:text-5xl font-bold text-transparent mb-6 bg-clip-text bg-gradient-to-br from-purple-800 via-purple-600 to-purple-800">
          Join the Waitlist
        </h2>
        <div className="font-medium text-xl text-purple-800">
          Be part of our journey <br />
        </div>
        <div className="text-xl text-center flex p-2 mb-6 text-indigo-800 flex-wrap mx-auto justify-center">
          Join the waitlist and build{" "}
          <Logo className="flex justify-center mr-3" />
          {"  "}
          together!
        </div>
        <form
          className="w-full max-w-sm"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleSubmit(formData);
          }}
        >
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full p-4 mb-4 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 border"
          />
          <ConfettiButton>
            <ShinyButton
              text={showConfetti ? "You're in !! 🚀 " : "Sign me up"}
              className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-300"
            />
          </ConfettiButton>
        </form>
      </div>
    </div>
  );
};

export default Waitlist;
