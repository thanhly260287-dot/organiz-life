import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ShareButton } from "./ShareButton";
import { useStore } from "@/lib/store";
import { Moon, Sun, Settings, ArrowLeft, BarChart3, Printer, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export function AppHeader({ showBack = false }: { showBack?: boolean }) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const router = useRouter();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.history.back()}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label={t("header.back")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Link to="/app">
            <Logo size={32} />
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <ShareButton />
          <Link
            to="/app/print"
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label={t("header.print")}
            activeProps={{ className: "p-2.5 rounded-xl bg-accent text-primary" }}
          >
            <Printer className="h-5 w-5" />
          </Link>
          <Link
            to="/app/stats"
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label={t("header.stats")}
            activeProps={{ className: "p-2.5 rounded-xl bg-accent text-primary" }}
          >
            <BarChart3 className="h-5 w-5" />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label={t("header.toggleTheme")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link
            to="/app/settings"
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label={t("header.settings")}
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label={t("header.logout")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
