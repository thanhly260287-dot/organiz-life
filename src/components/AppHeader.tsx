import { Link, useRouter } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { Moon, Sun, Settings, ArrowLeft, BarChart3 } from "lucide-react";

export function AppHeader({ showBack = false }: { showBack?: boolean }) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.history.back()}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Link to="/app">
            <Logo size={32} />
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label="Changer de thème"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link
            to="/app/settings"
            className="p-2.5 rounded-xl hover:bg-accent transition-all hover:scale-105"
            aria-label="Paramètres"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
