import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Cookie } from "lucide-react";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Politique de cookies — Organiz Life" },
      { name: "description", content: "Politique de cookies de l'application Organiz Life." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const lastUpdated = "29 mai 2026";

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Cookie className="h-5 w-5" />
          <span className="text-xs uppercase tracking-wide font-medium">Légal</span>
        </div>
        <h1 className="font-display font-bold text-3xl">Politique de cookies</h1>
        <p className="text-sm text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>
      </header>

      <article className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Qu'est-ce qu'un cookie ?</h2>
          <p className="text-muted-foreground">
            Un cookie est un petit fichier déposé sur votre appareil lorsque vous visitez un site ou
            une application. Organiz-Life utilise également le <em>localStorage</em> du navigateur pour
            sauvegarder vos préférences (thème, langue, vues personnalisées).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Cookies strictement nécessaires</h2>
          <p className="text-muted-foreground">
            Indispensables au fonctionnement : authentification, sécurité de session et conservation de
            vos préférences locales (thème, langue, filtres de la vue Évolution). Ils ne nécessitent
            pas votre consentement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Cookies de mesure d'audience</h2>
          <p className="text-muted-foreground">
            Lorsqu'ils sont activés, ils nous aident à comprendre l'usage de l'application de manière
            anonyme afin d'améliorer le service. Ils ne sont déposés qu'avec votre consentement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Cookies tiers</h2>
          <p className="text-muted-foreground">
            Certains services tiers (par ex. authentification Google, polices Google Fonts) peuvent
            déposer leurs propres cookies, soumis à leurs politiques respectives.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Gérer votre consentement</h2>
          <p className="text-muted-foreground">
            Vous pouvez à tout moment modifier votre choix en cliquant sur « Réinitialiser le
            consentement » ci-dessous. Le bandeau réapparaîtra à votre prochaine visite.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                window.localStorage.removeItem("cookieConsent");
                window.location.reload();
              } catch {}
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Cookie className="h-4 w-4" /> Réinitialiser le consentement
          </button>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">En savoir plus</h2>
          <p className="text-muted-foreground">
            Consultez aussi notre{" "}
            <Link to="/privacy" className="text-primary underline underline-offset-2">
              Politique de confidentialité
            </Link>{" "}
            et nos{" "}
            <Link to="/terms" className="text-primary underline underline-offset-2">
              CGU
            </Link>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
