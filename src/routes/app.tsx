import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { RemindersRunner } from "@/lib/useReminders";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    // Skip auth check during SSR — session lives in localStorage (client only)
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-aurora opacity-40 pointer-events-none -z-10" />
      <AppHeader />
      <RemindersRunner />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}

