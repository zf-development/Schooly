# Schooly

MVP d’une plateforme étudiante : réseau social d’établissement **et** outils académiques.

---

## Français

### Pourquoi ce dépôt est public

J’ai lancé et co-fondé ce projet. Après la vente de mes parts, l’entente me laissait **propriétaire du code source du MVP**, libre d’en faire ce que je veux. J’ai choisi de le rendre consultable ici : c’est un artefact de portfolio, pas un produit maintenu.

Ce MVP a été construit **avec des agents IA**, à un moment où je ne maîtrisais pas encore bien cette façon de travailler. Le code reflète donc une phase d’apprentissage : décisions inégales, périmètre trop large par endroits, et des modules marqués WIP. Ce n’est pas un modèle de « comment je construis un produit aujourd’hui » ; c’est une preuve que j’expérimentais déjà avec l’IA en conditions réelles, sur un vrai projet.

Aucun support n’est offert. Si quelqu’un veut reprendre, forker ou étudier le code, il se débrouille.

### Ce que le MVP explore

L’intention : un espace unique pour la vie de campus — ce qui se passe dans **mon école**, ce que je choisis de suivre ailleurs, et le quotidien académique (notes, calendrier, fichiers, devoirs).

**Cœur fonctionnel**

- Authentification et rattachement à un établissement
- Fil d’actualité local et publications publiques
- Abonnements à d’autres établissements
- Profil (nom affiché, avatar)
- Pages de notes et calendrier

**Expérimentations / WIP**

Messagerie, fichiers, devoirs, projets, notes de cours, quiz, tableau de session, et d’autres pistes (appels, courriels). Elles montrent l’ambition du périmètre plus qu’un produit fini.

### Stack (aperçu)

| Couche | Choix |
| --- | --- |
| Client | React, TypeScript, Vite, Mantine |
| API | Node.js, Express, TypeScript |
| Auth & données | Supabase (auth, base, storage) |

Architecture prévue multi-établissements ; une partie de cette préparation est restée désactivée ou incomplète dans le MVP.

### Licence

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). En clair :

- **Attribution obligatoire** — citer [Zachary Gagné](https://linkedin.com/in/zgagne) comme auteur original
- **Pas d’usage commercial** — pas de produit, SaaS, revente ou activité lucrative à partir de ce code
- **Aucun support, aucune garantie** — fourni tel quel

Le texte complet est dans [`LICENSE`](./LICENSE). Ce n’est pas une licence « open source » au sens OSI (qui autorise l’usage commercial) : c’est du **code source disponible**, avec citation et sans exploitation commerciale.

### Auteur

**Zachary Gagné**  
[LinkedIn](https://linkedin.com/in/zgagne) · [GitHub (ce dépôt)](https://github.com/gestion-deezing-inc/Schooly) · [contact.zgagne@gmail.com](mailto:contact.zgagne@gmail.com)

---

## English

### Why this repo is public

I launched and co-founded this project. After selling my shares, the agreement left me **owner of the MVP source code**, free to do what I want with it. I chose to publish it here: a portfolio artifact, not a maintained product.

This MVP was built **with AI agents**, at a time when I did not yet know how to use that workflow well. The codebase is a learning snapshot: uneven decisions, an oversized surface area in places, and modules still marked WIP. It is not a template for how I ship products today. It is evidence that I was already using AI on a real project, under real constraints.

There is no support. If you want to fork, study, or reuse the code, you are on your own.

### What the MVP explores

The idea: one place for campus life — what happens at **my school**, what I follow elsewhere, and day-to-day academic work (notes, calendar, files, homework).

**Working core**

- Authentication and institution membership
- Local feed and public posts
- Follow other institutions
- Profile (display name, avatar)
- Note pages and calendar

**Experiments / WIP**

Messaging, files, homework, projects, course notes, quizzes, session dashboard, and other probes (calls, email). They show the intended scope more than a finished product.

### Stack (overview)

| Layer | Choice |
| --- | --- |
| Client | React, TypeScript, Vite, Mantine |
| API | Node.js, Express, TypeScript |
| Auth & data | Supabase (auth, database, storage) |

A multi-institution architecture was planned; parts of that preparation stayed disabled or incomplete in the MVP.

### License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). In short:

- **Attribution required** — credit [Zachary Gagné](https://linkedin.com/in/zgagne) as the original author
- **Non-commercial** — no product, SaaS, resale, or for-profit use of this code
- **No support, no warranty** — provided as-is

The full text is in [`LICENSE`](./LICENSE). This is **not** OSI “open source” (which allows commercial use). It is **source-available** code: you may look at it and reuse it non-commercially if you cite the author.

### Author

**Zachary Gagné**  
[LinkedIn](https://linkedin.com/in/zgagne) · [GitHub (this repository)](https://github.com/gestion-deezing-inc/Schooly) · [contact.zgagne@gmail.com](mailto:contact.zgagne@gmail.com)
