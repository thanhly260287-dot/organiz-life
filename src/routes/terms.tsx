import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Conditions Générales d'Utilisation — Organiz Life" },
      { name: "description", content: "Conditions Générales d'Utilisation de l'application Organiz Life." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
          <FileText className="h-5 w-5" />
          <span className="text-xs uppercase tracking-wide font-medium">Légal</span>
        </div>
        <h1 className="font-display font-bold text-3xl">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>
      </header>

      <article className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">1. Acceptation des conditions</h2>
          <p className="text-muted-foreground">
            En accédant à Organiz-Life et en l'utilisant, vous acceptez d'être lié par les présentes
            Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas
            utiliser l'application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">2. Description du service</h2>
          <p className="text-muted-foreground">
            Organiz-Life est une application d'organisation personnelle qui permet de gérer des
            catégories, tâches, objectifs, vision boards et le suivi de l'évolution personnelle.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">3. Compte utilisateur</h2>
          <p className="text-muted-foreground">
            Vous êtes responsable du maintien de la confidentialité de votre compte et de toutes les
            activités qui s'y déroulent. Vous vous engagez à fournir des informations exactes lors de
            la création de votre compte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">4. Utilisation acceptable</h2>
          <p className="text-muted-foreground">
            Vous vous engagez à ne pas utiliser l'application à des fins illégales, abusives ou pouvant
            porter atteinte aux droits d'autrui. Tout usage frauduleux peut entraîner la suspension du
            compte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">5. Propriété intellectuelle</h2>
          <p className="text-muted-foreground">
            L'application, son design, son code et ses contenus sont la propriété d'Organiz-Life. Les
            données que vous saisissez restent votre propriété.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">6. Données personnelles</h2>
          <p className="text-muted-foreground">
            Le traitement de vos données personnelles est décrit dans notre{" "}
            <Link to="/privacy" className="text-primary underline underline-offset-2">
              Politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">7. Limitation de responsabilité</h2>
          <p className="text-muted-foreground">
            L'application est fournie « telle quelle ». Nous ne garantissons pas l'absence
            d'interruption ou d'erreurs et déclinons toute responsabilité quant aux dommages indirects
            résultant de son utilisation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">8. Résiliation</h2>
          <p className="text-muted-foreground">
            Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Nous nous réservons
            le droit de suspendre ou résilier l'accès en cas de non-respect des présentes conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">9. Modifications</h2>
          <p className="text-muted-foreground">
            Ces conditions peuvent être mises à jour. La date en haut de cette page reflète la dernière
            révision. L'utilisation continue de l'application vaut acceptation des modifications.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-semibold text-lg">10. Contact</h2>
          <p className="text-muted-foreground">
            Pour toute question concernant ces conditions, contactez-nous via le support de
            l'application.
          </p>
        </section>
      </article>
    </main>
  );
}
