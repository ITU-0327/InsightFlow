"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { getProjects } from "../../actions";
import { usePathname } from "next/navigation";
import { useClientConfig } from "../../hooks/use-config";

const GenerateInsightsButton = () => {
  const pathname = usePathname(); // Get the router object
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string>("");

  const { backend } = useClientConfig();

  // Fetch projects
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
    let eventSource: EventSource | null = null;

    if (loading && projectId) {
      const url = `${backend}/projects/${projectId}/ingest/`;
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        const newMessage = event.data;
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Stop loading when the process is complete
        if (
            newMessage.includes("Insights ready") ||
            newMessage.includes("Files status updated") ||
            newMessage.includes("Ingestion complete")
        ) {
          setLoading(false);
          if (eventSource) {
            eventSource.close();
          }
          // Dispatch a custom event when insights are ready
          window.dispatchEvent(new Event("insightsGenerated"));
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource failed:", err);
        setLoading(false);
        if (eventSource) {
          eventSource.close();
        }
      };
    }

    // Cleanup when the component is unmounted
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [loading, projectId, backend]);

  const startIngestion = () => {
    if (projectId) {
      setLoading(true); // Start loading and SSE will begin in useEffect
    }
  };

  // Check if the current path is not /dashboard/insights/
  if (pathname !== "/dashboard/insights") return null;

  return (
    <div className="">
      <button
        onClick={startIngestion}
        className={`px-4 py-2 rounded-md font-semibold text-white ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-purple-500 hover:bg-purple-600"
        }`}
        disabled={loading} // Disable button if loading or path is not /dashboard/insights/
      >
        {loading ? "Generating Insights..." : "Generate Insights ✨"}
      </button>
    </div>
  );
};

export default GenerateInsightsButton;
