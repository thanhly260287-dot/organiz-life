# Plan — Organiz-Life V1

Ton brief est très ambitieux (auth multi-méthodes, 25 catégories, vision board avec manipulation d'images, notifications push, sync cloud, export PDF/PNG, etc.). Pour livrer une app de qualité premium, je propose de construire par itérations. Voici la **V1** — fondation solide + expérience visuelle qui pose la marque. On ajoutera le reste ensuite étape par étape.

## V1 — Ce que je vais construire maintenant

### 1. Design system premium
- Tokens couleurs en `oklch` dans `src/styles.css` : bleu `#56CCF2`, violet `#9B51E0`, dégradés, glassmorphism, ombres modernes
- Mode sombre + clair avec transition fluide
- Préférence taille de texte (petit / moyen / grand) stockée localement
- Typographie moderne (Inter / Space Grotesk)
- Animations douces (fade, scale, slide) via tw-animate-css + Framer Motion

### 2. Logo Organiz-Life
- Logo SVG minimaliste : symbole de progression/évolution en dégradé bleu→violet
- Variantes light/dark

### 3. Pages
- **Landing** (`/`) : hero premium, présentation produit, CTA "Commencer"
- **Dashboard** (`/app`) : vue d'ensemble avec barre de progression de vie, stats, message de motivation, grille de catégories
- **Catégorie** (`/app/category/$id`) : liste des tâches/items, sous-catégories, vision board en bas
- **Paramètres** (`/app/settings`) : thème, taille texte

### 4. Catégories
- Les 25 catégories par défaut pré-créées
- Carte élégante : icône (Lucide), couleur, nom, priorité, barre de progression, compteur tâches
- Ajouter / modifier / supprimer
- Réorganisation drag & drop (dnd-kit)
- Sous-catégories illimitées

### 5. Tâches dans une catégorie
- Ajout avec : titre, date, heure, notes, priorité (1-5)
- Marquer comme terminée (barré automatique)
- Réorganisation drag & drop
- Toggle affichage des numéros de priorité

### 6. Vision Board (V1 simplifié)
- Zone créative en bas de chaque catégorie
- Ajout d'images (upload local) + textes
- Déplacement libre (drag)
- Redimensionnement et rotation basiques
- Export PNG (html-to-image)

### 7. Stockage
- **V1 : localStorage** pour aller vite et te montrer l'expérience
- Migration vers Lovable Cloud (auth Google/email + DB + storage + sync multi-appareils + export PDF) en V2

## V2 et au-delà (étapes suivantes après ton retour)

- **V2** : Lovable Cloud — auth Google + email, base de données, sync cloud, upload images
- **V3** : Auth téléphone (SMS), notifications push, rappels intelligents
- **V4** : Calendrier intégré, recherche intelligente, filtres avancés, export PDF haute qualité
- **V5** : Vision board avancé (rotation pinch, citations stylées, multi-couches, impression)
- **V6** : Statistiques avancées, suivi d'habitudes détaillé, gamification

## Pourquoi cette approche

Construire les 25+ catégories × toutes les fonctionnalités × auth × vision board complet × notifications en un seul shot produirait une app instable et superficielle. En livrant la V1 d'abord, tu vois immédiatement le look & feel premium, tu valides la direction, et on enrichit ensuite avec des bases solides.

Confirme-moi pour lancer la V1, ou dis-moi quels éléments tu veux prioriser différemment.
