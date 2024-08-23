"use client";
import React, { MutableRefObject, RefObject, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import NoteCard from "../dashboard/insights/components/NoteCard";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollTrailer() {
  const main: MutableRefObject<HTMLDivElement | null | undefined> = useRef();

  useGSAP(
    () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: main.current,
          scrub: 0.5,
          start: "top 40%", // Adjust as necessary
          end: "bottom 30%", // Adjust as necessary
          pin: true, // Pin the container to the center of the screen
          // markers: true, // Uncomment for debugging
          onEnterBack: () => {
            gsap.set(".result", { opacity: 0, display: "none" }); // Hide the result when scrolling back up
          },
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

      // Fade in the result after icons fade out
      timeline.to(
        ".result",
        {
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
          onStart: () => {
            gsap.set(".result", { display: "block" }); // Show the result when the animation starts
          },
        },
        "-=0.5" // Start fading in the result at the same time as icons fade out
      );

      // Stagger the animation of the NoteCards
      timeline.fromTo(
        ".result-card",
        {
          opacity: 0,
          y: 50, // Starting position (slightly below the normal position)
        },
        {
          opacity: 1,
          y: 0, // Ending position (normal position)
          duration: 4,
          ease: "power2.inOut",
          stagger: 1, // Stagger time between each card animation
        },
        "-=0.5" // Adjust this timing as necessary to control overlap with the previous animation
      );
    },
    { scope: main }
  );

  return (
    <div className="h-screen w-full p-10">
      <div className="mx-auto text-center font-light text-2xl text-neutral-600">
        Analyse accross multiple feedback channels , cut through the noise ...
      </div>
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

        <div className="result opacity-0 absolute text-neutral-600 w-screen flex justify-around">
          <div className="text-center text-2xl font-light text-neutral-600 mb-10">
            And know what your users
            <i className="text-purple-700 mx-2 font-medium">really</i> want.
          </div>
          <div className="flex w-8/12 mx-auto">
            <NoteCard
              note={{
                note: "User finds icons confusing",
                source: "User-Interview#1-Zoom-Transcript.txt",
                tags: ["pain points"],
                fullText: "User finds icons confusing",
              }}
              className="result-card"
            />
            <NoteCard
              note={{
                note: "User wants to set notification preferences to reduce notifications",
                source: "Typeform-pilot-survey.csv",
                tags: ["pain points", "behaviour"],
                fullText:
                  "User wants to set notification preferences to reduce notifications",
              }}
              className="result-card "
            />
            <NoteCard
              note={{
                note: "Need to load results page faster",
                source: "Intercom-queries.csv",
                tags: ["pain points"],
                fullText: "Need to load results page faster",
              }}
              className="result-card "
            />
          </div>
        </div>
      </div>
      <section className="section h-screen"></section>
    </div>
  );
}
