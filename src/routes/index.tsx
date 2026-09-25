import { createFileRoute } from "@tanstack/react-router";
import { ClinicApp } from "@/components/clinic/clinic-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ClinicApp />;
}
