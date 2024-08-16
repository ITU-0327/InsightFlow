"use client";
import React, { useEffect, useState } from "react";
import useSSE from "../../hooks/use-sse";
import { generateInsights } from "../actions";
import { useAuth } from "../../hooks/use-auth";
import { getProjects } from "../../actions";

const GenerateInsightsButton = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string>("");

  const [sseUrl, setSseUrl] = useState<string>("");
  const sseMessages = useSSE(sseUrl); // useSSE hook

  // Fetch projects and setup SSE
  useEffect(() => {
    const fetchProjects = async () => {
      const auth = await useAuth(); // useAuth hook
      if (auth?.userId) {
        try {
          const projects = await getProjects(auth.userId);
          if (projects.length === 0) {
            console.log("No projects found");
            return;
          }

          setProjectId(projects[0].id!);
          const url = `http://localhost:8000/api/projects/${projects[0].id}/ingest/`;
          setSseUrl(url); // Set SSE URL to start listening
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      } else {
        console.log("No user authenticated");
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    setMessages(sseMessages); // Update messages when sseMessages changes
  }, [sseMessages]);

  const startIngestion = async () => {
    if (projectId) {
      setLoading(true);
      try {
        const insightsResponse = await generateInsights(projectId);
        console.log(insightsResponse);
      } catch (error) {
        console.error("Error generating insights:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="">
      <button
        onClick={startIngestion}
        className={`px-4 py-2 rounded-md font-semibold text-white ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-purple-500 hover:bg-purple-600"
        }`}
        disabled={loading}
      >
        {loading ? "Generating Insights..." : "Generate Insights ✨"}
      </button>
      <div className="mt-4 space-y-2 w-full">
        {messages.map((message, index) => (
          <div key={index} className="p-2 border rounded-md bg-gray-100">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerateInsightsButton;
