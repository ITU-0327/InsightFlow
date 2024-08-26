import { createClient } from "@/utils/supabase/server";
import Hero from "./components/Hero";
import { NavBar } from "./components/Navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import ScrollTrailer from "./components/Trailer";
import Demo from "./components/Demo";
import FeaturesSectionDemo from "./components/features-section-demo-3";
import { Faq } from "./components/FAQSection";
import GetStarted from "./components/GetStarted";
import Footer from "./components/Footer";
import Waitlist from "./components/Waitlist";

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
          { name: "Waiting List", link: "#waitlist" },
        ]}
      />
      <Hero />
      <ScrollTrailer />
      <Demo />
      <GetStarted />
      <FeaturesSectionDemo />
      <Waitlist />
      <Faq />
      <Footer />
    </div>
  );
}
