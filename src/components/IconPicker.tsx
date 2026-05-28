import { useMemo, useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { Search } from "lucide-react";
import { IconRender } from "@/components/IconRender";

// FR/ES/DE/IT/PT keyword → English lucide-friendly hint map for popular categories
const KEYWORDS: Record<string, string> = {
  // sport / fitness
  sport: "dumbbell", sports: "dumbbell", fitness: "dumbbell", gym: "dumbbell",
  course: "footprints", courir: "footprints", run: "footprints", running: "footprints",
  velo: "bike", vélo: "bike", bike: "bike", cyclisme: "bike",
  // health
  sante: "heart-pulse", santé: "heart-pulse", health: "heart-pulse", salud: "heart-pulse",
  medecin: "stethoscope", médecin: "stethoscope", doctor: "stethoscope",
  // food
  cuisine: "chef-hat", food: "utensils", manger: "utensils", repas: "utensils",
  recette: "cooking-pot", recettes: "cooking-pot",
  // money
  argent: "wallet", money: "wallet", finance: "wallet", finances: "wallet",
  economie: "piggy-bank", économie: "piggy-bank", savings: "piggy-bank", epargne: "piggy-bank", épargne: "piggy-bank",
  banque: "landmark", bank: "landmark",
  dette: "trending-down", dettes: "trending-down", debt: "trending-down",
  // travel
  voyage: "plane", travel: "plane", vacances: "palmtree", holiday: "palmtree", vacation: "palmtree",
  // work / study
  travail: "briefcase", work: "briefcase", job: "briefcase", boulot: "briefcase",
  bureau: "monitor", office: "monitor",
  etude: "book-open", étude: "book-open", études: "book-open", study: "book-open", school: "graduation-cap", ecole: "graduation-cap", école: "graduation-cap",
  // home / family
  maison: "home", home: "home", famille: "users", family: "users",
  enfant: "baby", enfants: "baby", child: "baby", children: "baby",
  animal: "paw-print", animaux: "paw-print", pet: "paw-print", chien: "dog", chat: "cat",
  // leisure / creative
  loisir: "gamepad-2", loisirs: "gamepad-2", jeu: "gamepad-2", jeux: "gamepad-2", game: "gamepad-2", gaming: "gamepad-2",
  musique: "music", music: "music", lecture: "book", lire: "book", read: "book", livre: "book", livres: "book",
  film: "film", films: "film", cinema: "film", cinéma: "film", movie: "film", series: "tv", série: "tv", séries: "tv",
  photo: "camera", photos: "camera", art: "palette", dessin: "pencil", drawing: "pencil",
  // tech
  code: "code", developpement: "code", développement: "code", dev: "code", tech: "cpu",
  // social
  ami: "users", amis: "users", friend: "users", friends: "users",
  amour: "heart", love: "heart", couple: "heart",
  // misc
  voiture: "car", car: "car", transport: "bus",
  idee: "lightbulb", idée: "lightbulb", idea: "lightbulb", idées: "lightbulb", ideas: "lightbulb",
  objectif: "target", objectifs: "target", goal: "target", goals: "target",
  projet: "folder-kanban", projets: "folder-kanban", project: "folder-kanban",
  evenement: "calendar", événement: "calendar", event: "calendar", events: "calendar",
  rdv: "calendar-clock", "rendez-vous": "calendar-clock", meeting: "calendar-clock",
  cadeau: "gift", cadeaux: "gift", gift: "gift",
  shopping: "shopping-bag", achat: "shopping-bag", achats: "shopping-bag", courses: "shopping-cart",
  jardin: "sprout", jardinage: "sprout", garden: "sprout",
  meditation: "lotus", méditation: "lotus", yoga: "lotus",
  spirituel: "sparkles", spirituality: "sparkles",
  habitude: "repeat", habitudes: "repeat", habit: "repeat", habits: "repeat",
};

// Pre-build list of all lucide icon component names (PascalCase) once
const ALL_ICON_NAMES: string[] = (() => {
  const skip = new Set(["createLucideIcon", "icons", "Icon", "LucideIcon"]);
  return Object.keys(Icons)
    .filter((k) => /^[A-Z][A-Za-z0-9]*$/.test(k) && !skip.has(k) && !k.endsWith("Icon"))
    .sort();
})();

function pascalToKebab(s: string) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function IconPicker({
  value,
  onChange,
  prefill,
  placeholder,
}: {
  value: string;
  onChange: (name: string) => void;
  prefill?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  // When prefill (category name) changes and user hasn't typed, derive a search hint
  useEffect(() => {
    if (!prefill) return;
    const tokens = normalize(prefill).split(/[^a-z0-9]+/).filter(Boolean);
    for (const tok of tokens) {
      if (KEYWORDS[tok]) {
        setQuery(KEYWORDS[tok]);
        return;
      }
    }
    if (tokens[0]) setQuery(tokens[0]);
  }, [prefill]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return ALL_ICON_NAMES.slice(0, 60);
    return ALL_ICON_NAMES.filter((n) => pascalToKebab(n).includes(q)).slice(0, 60);
  }, [query]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-muted/40 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
        />
      </div>
      <div className="max-h-48 overflow-y-auto grid grid-cols-8 sm:grid-cols-10 gap-1.5 p-1">
        {results.length === 0 && (
          <div className="col-span-full text-xs text-muted-foreground text-center py-4">—</div>
        )}
        {results.map((ic) => (
          <button
            key={ic}
            type="button"
            onClick={() => onChange(ic)}
            title={ic}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${
              value === ic ? "bg-gradient-brand text-white" : "hover:bg-muted"
            }`}
          >
            <IconRender name={ic} className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
