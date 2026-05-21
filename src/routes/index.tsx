import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ArrowRight, Sparkles, Target, Layers, HeartPulse, Wallet, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Organiz-Life — Deviens la meilleure version de toi" },
      { name: "description", content: "Application premium d'organisation de vie et de développement personnel. Catégories illimitées, vision board, suivi d'objectifs." },
    ],
  }),
});

const features = [
  { icon: Layers, title: "Catégories illimitées", desc: "Organise chaque domaine de ta vie avec des cartes élégantes, drag & drop, priorités." },
  { icon: Target, title: "Objectifs & habitudes", desc: "Suis ta progression jour après jour avec des barres élégantes et motivantes." },
  { icon: HeartPulse, title: "Santé & bien-être", desc: "Sport, alimentation, mental — garde tout en équilibre dans une seule app." },
  { icon: Wallet, title: "Finances claires", desc: "Revenus, dettes, économies, placements. Une vue claire sur ton patrimoine." },
  { icon: ImageIcon, title: "Vision Board créatif", desc: "Imagine ta vie idéale. Drag, rotation, export PNG haute qualité." },
  { icon: Sparkles, title: "Premium & inspirant", desc: "Design ultra moderne, mode sombre & clair, animations fluides." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-aurora">
      <header className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex items-center justify-between">
        <Logo />
        <Link
          to="/app"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white shadow-glow hover:scale-105 transition-transform"
        >
          Ouvrir l'app <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 sm:pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass shadow-glass text-xs font-medium mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-gradient" style={{ color: "var(--brand-violet)" }} />
          Ta vie, organisée comme jamais
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="font-display font-bold text-5xl sm:text-7xl tracking-tight leading-[1.05]"
        >
          Deviens la meilleure
          <br />
          <span className="text-gradient">version de toi.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Organise ton quotidien, tes objectifs, ta santé, tes finances et ton bien-être dans une app premium, fluide et inspirante.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-7 py-3.5 text-base font-semibold text-white shadow-glow hover:scale-105 transition-transform"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-2xl glass shadow-glass px-7 py-3.5 text-base font-medium hover:scale-105 transition-transform"
          >
            Découvrir
          </a>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group glass rounded-2xl p-6 shadow-glass hover:shadow-elevated hover:-translate-y-1 transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo size={28} />
          <p>© {new Date().getFullYear()} Organiz-Life. Conçu pour t'inspirer.</p>
        </div>
      </footer>
    </div>
  );
}
