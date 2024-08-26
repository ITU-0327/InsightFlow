import MagicBlob from "@/components/MagicBlob";
import ShinyButton from "@/components/ShinyButton";
import Logo from "@/components/ui/logo";
import React from "react";

const Waitlist = () => {
  return (
    <div className="relative h-screen" id="waitlist">
      <MagicBlob />
      <div className="flex flex-col items-center h-full justify-center max-w-xl text-center">
        <h2 className="text-5xl md:text-5xl font-bold text-transparent mb-6 bg-clip-text bg-gradient-to-bl from-indigo-900 via-purple-600 to-purple-800">
          Join the Waitlist
        </h2>
        <div className="font-medium text-xl text-purple-800">
          Be part of our journey <br />
        </div>
        <div className="text-xl text-center flex p-2  mb-6 text-indigo-800">
          Join the waitlist and build{" "}
          <Logo className="flex justify-center mr-3" />
          {"  "}
          together!
        </div>
        <form className="w-full max-w-md">
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full p-4 mb-4 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 border"
          />
          <ShinyButton
            text="Sign me up"
            className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-300"
          />
        </form>
      </div>
    </div>
  );
};

export default Waitlist;
