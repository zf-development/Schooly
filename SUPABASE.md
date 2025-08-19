### Phase 0 – Setup Supabase (Cloud)

#### Projet & Clés
- [x] Créer le projet Supabase (org, region)
- [x] Récupérer `Project URL`, `anon key`, `service_role key`
- [x] Ajouter les clés dans les `.env` (front/back)

#### Auth & URLs
- [x] Activer Email/Password
- [x] Définir Redirect URLs (dev/prod)
- [ ] (Optionnel) Configurer OAuth providers

#### SMTP
- [x] Configurer SMTP (Mailgun/Sendgrid/Postmark)
- [x] Définir `From` vérifié
- [ ] (Optionnel) Email testing en dev

#### Base de données
- [x] Créer tables `institutions`, `users`, `feeds`
- [x] Ajouter index sur `feeds(institution_id)` et `feeds(created_at)`
- [ ] (Optionnel) Créer une vue pour feed “mixte” école courante + public

#### RLS & Policies
- [x] Activer RLS sur `users`, `institutions`, `feeds`
- [x] Policy `users`: select/insert/update uniquement sur soi
- [x] Policy `institutions`: lecture publique (ou `authenticated` uniquement)
- [x] Policy `feeds`: select (même école ou `public`)
- [x] Policy `feeds`: insert (auteur = user & même institution)
- [x] Policy `feeds`: update/delete (auteur = user)

#### Seed & Storage
- [x] Insérer 2 institutions (`mgr-parent`, `cegep-edouard-montpetit`)
- [ ] Créer un compte test via Auth
- [ ] Lier `users.institution_id` pour le compte test
- [x] (Optionnel) Créer buckets `institution-logos` (public) et `avatars` (protected)

#### Validation
- [ ] Test login (email/password) → redirect `/feed`
- [ ] Test insert d’un post (private) dans son école
- [ ] Test lecture de feed inter-écoles (public seulement)
- [ ] Vérifier refus d’accès aux posts privés d’une autre école