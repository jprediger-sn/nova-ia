import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: HomeRedirect,
});

function HomeRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/models", replace: true });
  }, [navigate]);
  return null;
}