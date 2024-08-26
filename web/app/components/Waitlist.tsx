import MagicBlob from "@/components/MagicBlob";
import ShinyButton from "@/components/ShinyButton";
import React from "react";

const Waitlist = () => {
  return (
    <div className="relative my-40" id="waitlist">
      <MagicBlob />
      <div className="flex flex-col items-center justify-center max-w-xl text-center">
        <h2 className="text-4xl font-bold text-transparent mb-6 bg-clip-text bg-gradient-to-bl from-purple-200 via-white to-purple-200">
          Join the Waitlist
        </h2>
        <p className="font-medium text-xl text-white mb-6">
          Be part of our journey <br />
          Join the waitlist and build InsightFlow together!
        </p>
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
