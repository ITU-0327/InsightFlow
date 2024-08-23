"use client";
import React, { MutableRefObject, RefObject, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollTrailer() {
  const main: MutableRefObject<HTMLDivElement | null | undefined> = useRef();

  useGSAP(
    () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: main.current,
          scrub: 0.5,
          start: "top 15%", // Adjust as necessary
          end: "bottom 30%", // Adjust as necessary
          pin: true, // Pin the container to the center of the screen
          // markers: true, // Uncomment for debugging
        },
      });

      const icons = gsap.utils.toArray(".icons");
      const halfLength = Math.ceil(icons.length / 2);

      // Move the first half of the icons to the left
      icons.slice(0, halfLength).forEach((icon) => {
        timeline.to(
          icon as any,
          {
            xPercent: -100, // Move to the left
            opacity: 0,
            filter: "blur(10px)", // Apply blur filter as it fades out
            duration: 2,
            ease: "power2.inOut",
          },
          "-=0.5"
        );
      });

      // Move the second half of the icons to the right
      icons.slice(halfLength).forEach((icon) => {
        timeline.to(
          icon as any,
          {
            xPercent: 100, // Move to the right
            opacity: 0,
            filter: "blur(10px)", // Apply blur filter as it fades out
            duration: 2,
            ease: "power2.inOut",
          },
          "-=1.5"
        ); // Overlap with the first half's animation
      });

      // Fade in the result at the same time as icons fade out
      timeline.to(
        ".result",
        {
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        0 // Start fading in the result at the same time as icons fade out
      );
    },
    { scope: main }
  );

  return (
    <div className="h-screen w-full p-10">
      <div className="mx-auto text-center font-light text-2xl text-neutral-600">
        Cut through the noise and know
        <i className="text-purple-700 mx-2 font-medium">exactly</i>what your
        users want
      </div>{" "}
      <div
        className="section mx-auto w-[80%] h-[300px] flex gap-3 justify-around items-center"
        ref={main as RefObject<HTMLDivElement>}
      >
        <div className="icons">
          <Image
            src="/icons/google-forms.svg"
            width={50}
            height={100}
            alt="Google Forms"
            className="mt-[30px]"
          />
        </div>
        <div className="icons">
          <Image
            src="/icons/google-play-4.svg"
            width={150}
            height={100}
            alt="Google Play"
            className="mt-[20px]"
          />
        </div>
        <div className="icons">
          <Image
            src="/icons/hubspot-1.svg"
            width={50}
            height={50}
            alt="HubSpot"
            className="mt-[50px]"
          />
        </div>
        <div className="icons">
          <Image
            src="/icons/intercom-2.svg"
            width={50}
            height={50}
            alt="Intercom"
            className="mt-[50px]"
          />
        </div>
        <div className="icons">
          <Image
            src="/icons/logo-surveymonkey.svg"
            width={200}
            height={50}
            alt="SurveyMonkey"
            className="mt-[30px]"
          />
        </div>
        <div className="icons">
          <Image
            src="/icons/salesforce-2.svg"
            width={100}
            height={50}
            alt="Salesforce"
            className="mt-[10px]"
          />
        </div>
        <div className="icons">
          <Image
            src="/icons/zoom-app.svg"
            width={50}
            height={50}
            alt="Zoom"
            className="mt-[20px]"
          />
        </div>
      </div>
      <section className="section h-screen"></section>
    </div>
  );
}
