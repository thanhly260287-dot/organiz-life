import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-aurora opacity-40 pointer-events-none -z-10" />
      <AppHeader />
      <Outlet />
    </div>
  );
}
