import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "cookieConsent";

type Consent = "accepted" | "rejected";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v !== "accepted" && v !== "rejected") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const setChoice = (c: Consent) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md"
          role="dialog"
          aria-live="polite"
          aria-label="Consentement aux cookies"
        >
          <div className="glass shadow-elevated rounded-2xl border border-border p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <Cookie className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold text-sm">Cookies & préférences</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Nous utilisons des cookies et le stockage local pour faire fonctionner l'app et
                  mémoriser tes préférences. Consulte notre{" "}
                  <Link to="/cookies" className="text-primary underline underline-offset-2">
                    politique de cookies
                  </Link>
                  .
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setChoice("accepted")}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-brand text-white px-3.5 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Tout accepter
                  </button>
                  <button
                    onClick={() => setChoice("rejected")}
                    className="inline-flex items-center justify-center rounded-xl border border-border px-3.5 py-2 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    Refuser
                  </button>
                  <Link
                    to="/cookies"
                    className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Personnaliser
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setChoice("rejected")}
                aria-label="Fermer"
                className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
