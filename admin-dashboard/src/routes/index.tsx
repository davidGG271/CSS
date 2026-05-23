import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const clientUrl = import.meta.env.VITE_CLIENT_URL || "http://localhost:8000";
      window.location.href = clientUrl;
    }
  },
  component: () => null,
});
