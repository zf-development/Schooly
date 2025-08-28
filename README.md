# StudBud – MVP

## 🧱 Stack

-   **Frontend** : ReactJS + Mantine UI
-   **Backend** : NodeJS avec API REST
-   **Auth & DB** : Supabase (auth + storage)
-   **IDE** : Cursor (avec AI)
-   **MVP** : Architecture multi-tenant prévue mais désactivée pour le moment

---

## 📁 Structure du projet

### Front-end (`/client`)

/src
├── /components # Composants UI (réutilisables)
├── /pages # Pages (Login, Feed, Profile)
├── /layouts # Layouts de pages
├── /hooks # Custom hooks
├── /services # Appels à Supabase ou à l'API backend
├── /contexts # Auth / User / Institution context
├── /utils # Fonctions utilitaires
└── main.tsx # Entrée principale

### Back-end (`/server`)

/src
├── /controllers # Logique métier (feeds, users)
├── /routes # Routes Express
├── /services # Services externes (Supabase, etc.)
├── /middlewares # Authentification, erreurs
├── /utils # Fonctions auxiliaires
└── app.js # Serveur Express

---

## 🤖 Convention pour Cursor AI

-   Utilise les fichiers `.prompt.md` dans chaque dossier pour décrire sa structure.
-   Ne réécris **jamais** du code sans confirmation explicite.
-   Si une décision n’est pas claire : ajoute un `TODO:` ou pose une question dans le prompt AI.
-   Ne touche **jamais** à un fichier existant si ce n’est pas demandé.

---

## ✅ Ce que le MVP doit faire

-   Authentification via Supabase
-   Attribution de l’utilisateur à une institution
-   Création de posts (texte)
-   Affichage du feed local et public
-   Affichage profil de base
-   Structure préparée pour Kubernetes multi-tenant (désactivé dans MVP)

---

## 📌 Institutions (préremplies)

-   MGR Parent
-   Cégep Édouard-Montpetit

---

## 🔄 Flux utilisateur

1. L’utilisateur se connecte ou crée un compte
2. Il est automatiquement rattaché à une institution
3. Il voit le fil d’actualité de son école
4. Il peut publier un message ou voir les publications publiques des autres écoles

---

## 🧪 Testable dès :

-   La fin de la Phase 2 (UI + Feed)

linear-gradient(135deg, #667eea 0%, #764ba2 100%)
