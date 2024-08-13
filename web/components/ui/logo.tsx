import { IconInfinity, IconSparkles } from "@tabler/icons-react";
import React from "react";

const Logo = () => {
  return (
    <div className="flex">
      <div>
        <IconInfinity className="mx-1 text-indigo-700" size={30} />
      </div>

      <div className="flex items-center">
        <h1 className="mr-1 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-500 ">
          InsightFlow
        </h1>
        <IconSparkles className="text-purple-500 " />
      </div>
    </div>
  );
};

export default Logo;
