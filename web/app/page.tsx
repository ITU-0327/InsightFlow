import { createClient } from "@/utils/supabase/server";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Draggable } from "gsap/Draggable";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { EaselPlugin } from "gsap/EaselPlugin";
import { PixiPlugin } from "gsap/PixiPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import Hero from "./components/Hero";
import { NavBar } from "./components/Navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import ScrollTrailer from "./components/Trailer";
import Demo from "./components/Demo";

export default async function Index() {
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };
  // permanentRedirect("/dashboard");
  const isSupabaseConnected = canInitSupabaseClient();
  gsap.registerPlugin(
    useGSAP,
    Flip,
    ScrollTrigger,
    Observer,
    ScrollToPlugin,
    Draggable,
    MotionPathPlugin,
    EaselPlugin,
    PixiPlugin,
    TextPlugin,
    RoughEase,
    ExpoScaleEase,
    SlowMo,
    CustomEase
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <AuroraBackground
        className="fixed left-0 top-0 -z-10 h-full w-full"
        showRadialGradient={true}
      />
      <NavBar
        tabs={[
          { name: "Demo", link: "#demo" },
          { name: "Features", link: "#features" },
          { name: "FAQ", link: "#faq" },
          { name: "Waiting List", link: "#waitinglist" },
        ]}
      />
      <Hero />
      <ScrollTrailer />
      <Demo />
    </div>
  );
}
