# ✅ Roadmap – Suite du MVP Skolarae

## 1) Page de profil (ProfilePage)

### Backend

-   [x] Ajouter colonons dans `public.users` :
    -   [x] `display_name text`
    -   [x] `avatar_url text`
-   [x] Endpoint **GET** `/users/me` → retourne `{ id, email, institution_id, display_name, avatar_url }`
-   [x] Endpoint **PATCH** `/users/me` → met à jour `display_name`, `avatar_url`
-   [x] **RLS** : l'utilisateur ne peut mettre à jour **que** sa propre ligne (`id = auth.uid()`)

### Frontend

-   [x] Route `/profile`
-   [x] Page `ProfilePage.tsx`
    -   [x] Affiche email (readonly)
    -   [x] Champ `display_name` éditable
    -   [x] Champ `avatar_url` (ou upload simple)
    -   [x] Bouton **Enregistrer**
-   [x] Service `userService.ts` → `getMe()`, `updateMe(payload)`
-   [x] Notifications succès/erreur

**Critères d'acceptation**

-   [x] Un utilisateur connecté voit ses infos actuelles
-   [x] Il peut modifier `display_name` et `avatar_url`
-   [x] RLS empêche la modification d'un autre user

---

## 2) Abonnement à d'autres établissements (follow/subscriptions)

### Backend

-   [x] Créer table `public.subscriptions` :

```sql
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  follower_user_id uuid references public.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete cascade,
  created_at timestamptz default now(),
  unique (follower_user_id, institution_id)
);
```

-   [x] Activer RLS + Policies :

```sql
alter table public.subscriptions enable row level security;

create policy "select own subs"
on public.subscriptions for select
to authenticated
using (follower_user_id = auth.uid());

create policy "insert own subs"
on public.subscriptions for insert
to authenticated
with check (follower_user_id = auth.uid());

create policy "delete own subs"
on public.subscriptions for delete
to authenticated
using (follower_user_id = auth.uid());
```

-   [x] API :
    -   [x] **GET** `/subscriptions`
    -   [x] **POST** `/subscriptions` body: `{ institution_id }`
    -   [x] **DELETE** `/subscriptions/:institution_id`
-   [x] Adapter **GET** `/feeds` → inclure :
    -   [x] Tous les posts de mon école
    -   [x] -   Posts `visibility='public'` des institutions **suivies**

### Frontend

-   [x] Service `subscriptionService.ts` → `list()`, `follow(id)`, `unfollow(id)`
-   [x] Composant `InstitutionFollowButton`
-   [x] Section "Établissements suivis" (dans `/profile` ou `/feed`)
-   [x] Adapter `FeedPage.tsx` → intégrer posts suivis

**Critères d'acceptation**

-   [x] Un user peut suivre/désuivre une école
-   [x] Le feed inclut les posts publics des écoles suivies
-   [x] Unicité respectée (`unique follower_user_id + institution_id`)

---

## 3) Améliorer le design (base)

### Thème Mantine

-   [x] Définir couleurs, radius, font globale
-   [x] Appliquer `MantineProvider` avec ce thème

### Composants

-   [x] Boutons, Inputs, Badges cohérents
-   [x] `Paper`/`Card` avec ombrages légers
-   [x] Espacement cohérent via Mantine spacing

### Pages

-   [x] `LoginPage` : carte centrée + branding
-   [x] `FeedPage` : feed lisible (titre + séparateurs)
-   [x] `PostCard` : avatar, badge public/privé, date formatée

**Critères d'acceptation**

-   [x] UI cohérente (couleurs/typos/espacements)
-   [x] Pages lisibles et utilisables sur desktop et mobile

---

## 4) Donner un look plus _cool_

-   [x] Palette moderne (ex: violet/bleu académique)
-   [x] Header custom (logo + nav clean)
-   [x] Icônes (Tabler Icons avec Mantine)
-   [x] Responsive : menu burger sur mobile
-   [x] Avatars par défaut (placeholder si pas d'upload)

**Critères d'acceptation**

-   [x] Style distinct et "présentable"
-   [x] Fonctionne correctement sur mobile

---

## 5) Implémenter la déconnexion

### Frontend

-   [x] `AuthButton` → appeler `supabase.auth.signOut()`
-   [x] Nettoyer `UserContext` + `InstitutionContext`
-   [x] Rediriger vers `/login`

### Backend

-   [x] (Optionnel) Endpoint `POST /auth/logout` (si proxifié)
-   [x] Sinon : utiliser directement `supabase.auth.signOut()` côté client

**Critères d'acceptation**

-   [x] Le bouton déconnecte proprement
-   [x] Redirection automatique `/login`
-   [x] Feed inaccessible hors session

---

## ✅ QA global

-   [x] Login → feed → créer post → suivre école → voir posts suivis → modifier profil → logout
-   [x] Vérifier RLS empêche les accès cross-user
-   [x] Aucun secret exposé au front
