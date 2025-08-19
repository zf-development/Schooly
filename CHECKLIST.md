# ✅ StudBud – Tâches fonctionnelles, logiques, design & UX

---

## 🧠 Logique métier (Back-end & règles fonctionnelles)

### 🔐 Authentification & sécurité
- [x] Vérifier que chaque route protégée utilise `authMiddleware.ts`
- [ ] **🚨 CRITIQUE** : Remplacer l'authentification simulée par une vraie validation JWT/Supabase
- [ ] Ajouter vérification de rôle ou institution dans les contrôleurs (si requis)
- [x] Valider les inputs serveur-side pour `/auth` et `/feeds`
- [x] Limiter les accès aux posts privés à l'école d'origine uniquement

### 🧩 Feed & logique inter-école
- [x] Lorsqu'un post est créé, stocker son `visibility` (`public` ou `private`)
- [x] Lorsqu'un feed est affiché, filtrer selon :
  - [x] école = utilisateur → tous les posts
  - [x] école ≠ utilisateur → seulement `visibility: public`
- [x] Ajouter fallback si école inactive ou non trouvée

### 🗃 Gestion Supabase
- [x] Vérifier les tables `users`, `institutions`, `feeds` sont bien liées
- [x] Implémenter l'enregistrement automatique de l'utilisateur dans `users` après login/register
- [x] Lier correctement chaque utilisateur à son `institution_id`

---

## 🎨 Design UI (Mantine + UX)

### 🌐 Global
- [x] Intégrer le thème Mantine global (`MantineProvider`)
- [x] Définir une palette de couleurs cohérente (ex: académique, soft)
- [x] Utiliser le `Container`, `Paper`, `Card`, `Button`, `TextInput`, `Textarea` de Mantine
- [x] Créer une page de démo pour tous les composants utilisés et les composants custom

### 📄 Pages
- [ ] LoginPage :
  - [x] Champs bien espacés, erreurs claires
  - [x] Redirection vers le dashboard en cas de succès
- [ ] FeedPage :
  - [x] Afficher les posts avec `PostCard.tsx`
  - [x] Afficher le formulaire `PostForm.tsx` au-dessus du feed
  - [x] Ajouter une info bulle si aucun post n’est visible

### 🧩 Composants
- [ ] `AuthButton.tsx` : connexion / déconnexion avec status clair
- [ ] `PostCard.tsx` : formatage du texte, date, avatar institutionnel
- [ ] `PostForm.tsx` : texte + bouton + validation rapide
- [ ] `InstitutionSelector.tsx` (menu déroulant pour changer d’école)

---

## 🧪 UX & Feedback utilisateur

### 🔔 Interaction utilisateur
- [ ] Ajouter un toast (Mantine Notification) après :
  - [ ] Connexion réussie / échouée
  - [ ] Création de post réussie / échouée
- [ ] Rediriger vers `/feed` après connexion

### 🕵️‍♂️ Gestion des erreurs
- [ ] Afficher erreur claire si l’institution de l’utilisateur n’existe pas
- [ ] Gérer les erreurs réseau dans les services Supabase
- [ ] Afficher un loader (`Loader`) pendant les appels API

---

## 🔐 Sécurité et validation

### 🛡 Front-end
- [ ] Ne jamais afficher de bouton ou d’action sensible sans `user` connecté
- [ ] Vérifier que les composants sensibles vérifient la présence de `UserContext`

### 🛡 Back-end
- [ ] Supprimer les données sensibles du retour (`password`, `token`, etc.)
- [ ] Valider les inputs dans tous les endpoints (ex: `feedController.ts`)
- [ ] Ajouter des codes d’erreurs clairs (400, 401, 403, 500…)

---

## 🧹 Nettoyage & finalisation
- [ ] Supprimer tous les `console.log` non utiles
- [ ] Ajouter un fichier `.env.example` avec les clés nécessaires (URL Supabase, etc.)
- [ ] Compléter le `README.md` avec instructions d’installation
- [ ] Vérifier que tous les fichiers `.prompt.md` sont en place
- [ ] Vérifier que les checklists sont à jour