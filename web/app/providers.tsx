// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    autocapture: {
      dom_event_allowlist: ["click"], // DOM events from this list ['click', 'change', 'submit']
      url_allowlist: ["posthog.com./docs/.*"], // strings or RegExps
      element_allowlist: ["button"], // DOM elements from this list ['a', 'button', 'form', 'input', 'select', 'textarea', 'label']
      css_selector_allowlist: ["[ph-autocapture]"], // List of CSS selectors
      element_attribute_ignorelist: ['data-attr-pii="email"'], // List of element attributes to ignore
    },
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
