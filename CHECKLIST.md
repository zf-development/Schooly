# ✅ Roadmap – Suite du MVP StudBud

## 1) Page de profil (ProfilePage)

### Backend
- [ ] Ajouter colonons dans `public.users` :
  - [ ] `display_name text`
  - [ ] `avatar_url text`
- [ ] Endpoint **GET** `/users/me` → retourne `{ id, email, institution_id, display_name, avatar_url }`
- [ ] Endpoint **PATCH** `/users/me` → met à jour `display_name`, `avatar_url`
- [ ] **RLS** : l’utilisateur ne peut mettre à jour **que** sa propre ligne (`id = auth.uid()`)

### Frontend
- [ ] Route `/profile`
- [ ] Page `ProfilePage.tsx`
  - [ ] Affiche email (readonly)
  - [ ] Champ `display_name` éditable
  - [ ] Champ `avatar_url` (ou upload simple)
  - [ ] Bouton **Enregistrer**
- [ ] Service `userService.ts` → `getMe()`, `updateMe(payload)`
- [ ] Notifications succès/erreur

**Critères d’acceptation**
- [ ] Un utilisateur connecté voit ses infos actuelles  
- [ ] Il peut modifier `display_name` et `avatar_url`  
- [ ] RLS empêche la modification d’un autre user  

---

## 2) Abonnement à d’autres établissements (follow/subscriptions)

### Backend

- [ ] Créer table `public.subscriptions` :

```sql
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  follower_user_id uuid references public.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete cascade,
  created_at timestamptz default now(),
  unique (follower_user_id, institution_id)
);
```

- [ ] Activer RLS + Policies :

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

- [ ] API :
  - [ ] **GET** `/subscriptions`
  - [ ] **POST** `/subscriptions` body: `{ institution_id }`
  - [ ] **DELETE** `/subscriptions/:institution_id`
- [ ] Adapter **GET** `/feeds` → inclure :
  - [ ] Tous les posts de mon école  
  - [ ] + Posts `visibility='public'` des institutions **suivies**

### Frontend
- [ ] Service `subscriptionService.ts` → `list()`, `follow(id)`, `unfollow(id)`
- [ ] Composant `InstitutionFollowButton`
- [ ] Section “Établissements suivis” (dans `/profile` ou `/feed`)
- [ ] Adapter `FeedPage.tsx` → intégrer posts suivis

**Critères d’acceptation**
- [ ] Un user peut suivre/désuivre une école  
- [ ] Le feed inclut les posts publics des écoles suivies  
- [ ] Unicité respectée (`unique follower_user_id + institution_id`)  

---

## 3) Améliorer le design (base)

### Thème Mantine
- [ ] Définir couleurs, radius, font globale
- [ ] Appliquer `MantineProvider` avec ce thème

### Composants
- [ ] Boutons, Inputs, Badges cohérents
- [ ] `Paper`/`Card` avec ombrages légers
- [ ] Espacement cohérent via Mantine spacing

### Pages
- [ ] `LoginPage` : carte centrée + branding
- [ ] `FeedPage` : feed lisible (titre + séparateurs)
- [ ] `PostCard` : avatar, badge public/privé, date formatée

**Critères d’acceptation**
- [ ] UI cohérente (couleurs/typos/espacements)  
- [ ] Pages lisibles et utilisables sur desktop et mobile  

---

## 4) Donner un look plus *cool*

- [ ] Palette moderne (ex: violet/bleu académique)
- [ ] Header custom (logo + nav clean)
- [ ] Icônes (Tabler Icons avec Mantine)
- [ ] Responsive : menu burger sur mobile
- [ ] Avatars par défaut (placeholder si pas d’upload)

**Critères d’acceptation**
- [ ] Style distinct et “présentable”  
- [ ] Fonctionne correctement sur mobile  

---

## 5) Implémenter la déconnexion

### Frontend
- [ ] `AuthButton` → appeler `supabase.auth.signOut()`
- [ ] Nettoyer `UserContext` + `InstitutionContext`
- [ ] Rediriger vers `/login`

### Backend
- [ ] (Optionnel) Endpoint `POST /auth/logout` (si proxifié)
- [ ] Sinon : utiliser directement `supabase.auth.signOut()` côté client

**Critères d’acceptation**
- [ ] Le bouton déconnecte proprement  
- [ ] Redirection automatique `/login`  
- [ ] Feed inaccessible hors session  

---

## ✅ QA global

- [ ] Login → feed → créer post → suivre école → voir posts suivis → modifier profil → logout  
- [ ] Vérifier RLS empêche les accès cross-user  
- [ ] Aucun secret exposé au front  
