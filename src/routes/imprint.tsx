import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2 } from "lucide-react";

export const Route = createFileRoute("/imprint")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Organiz Life" },
      { name: "description", content: "Mentions légales de l'application Organiz Life." },
    ],
  }),
  component: ImprintPage,
});

function ImprintPage() {
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
          <Building2 className="h-5 w-5" />
          <span className="text-xs uppercase tracking-wide font-medium">Légal</span>
        </div>
        <h1 className="font-display font-bold text-3xl">Mentions légales</h1>
        <p className="text-sm text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>
      </header>

      <article className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Éditeur</h2>
          <p className="text-muted-foreground">
            Organiz-Life
            <br />
            [Nom / raison sociale à compléter]
            <br />
            [Adresse postale à compléter]
            <br />
            Email : [contact@organiz-life.com]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Directeur de la publication</h2>
          <p className="text-muted-foreground">[Nom du responsable à compléter]</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Hébergement</h2>
          <p className="text-muted-foreground">
            L'application est hébergée par Lovable / Cloudflare Workers.
            <br />
            Site : lovable.app
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Propriété intellectuelle</h2>
          <p className="text-muted-foreground">
            L'ensemble des éléments présents sur l'application (textes, visuels, code, logo) sont
            protégés par le droit d'auteur. Toute reproduction non autorisée est interdite.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Données personnelles</h2>
          <p className="text-muted-foreground">
            Le traitement des données personnelles est décrit dans la{" "}
            <Link to="/privacy" className="text-primary underline underline-offset-2">
              Politique de confidentialité
            </Link>
            . L'utilisation du service est encadrée par les{" "}
            <Link to="/terms" className="text-primary underline underline-offset-2">
              Conditions Générales d'Utilisation
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">Contact</h2>
          <p className="text-muted-foreground">
            Pour toute question, vous pouvez nous écrire via le support de l'application.
          </p>
        </section>
      </article>
    </main>
  );
}
