import React from "react";

const Demo = () => {
  return (
    <div className="p-10 my-24 w-screen h-[500px] text-center " id="demo">
      <div className="text-5xl font-medium text-gray-800 mb-7">Demo</div>
      <div className="max-w-5xl mx-auto aspect-w-16">
        <iframe
          src="https://player.vimeo.com/video/1002011129?badge=0&autopause=0&player_id=0&app_id=58479"
          allow="autoplay; fullscreen; clipboard-write"
          allowFullScreen
          className="w-full h-[500px] p-3"
          title="InsightFlow"
        ></iframe>
      </div>
    </div>
  );
};

export default Demo;
