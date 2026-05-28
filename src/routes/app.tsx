import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { RemindersRunner } from "@/lib/useReminders";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    // INTENTIONAL SSR SKIP — auth state lives in localStorage (client-only).
    // The SSR response is a static shell with no user data; all user content
    // is loaded client-side after hydration. The client-side check below
    // enforces the auth gate before any protected content renders.
    //
    // ⚠️ SECURITY: If you ever add server functions or SSR-rendered content
    // that returns per-user data under /app, you MUST first replace this
    // guard with a cookie/header-based auth check (see
    // src/integrations/supabase/auth-middleware.ts) — otherwise unauthenticated
    // SSR responses will leak user data.
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
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

