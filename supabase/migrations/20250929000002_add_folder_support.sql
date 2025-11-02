-- Ajouter le support des dossiers à la table pages
-- Migration pour ajouter le type et parent_id

-- Ajouter une colonne type pour distinguer les pages des dossiers
ALTER TABLE public.pages
ADD COLUMN type text NOT NULL DEFAULT 'page'
CHECK (type IN ('page', 'folder'));

-- Ajouter une colonne parent_id pour la hiérarchie
ALTER TABLE public.pages
ADD COLUMN parent_id uuid REFERENCES public.pages(id) ON DELETE CASCADE;

-- Modifier la colonne content pour permettre NULL (pour les dossiers)
ALTER TABLE public.pages
ALTER COLUMN content DROP NOT NULL;

-- Index pour améliorer les performances des requêtes hiérarchiques
CREATE INDEX idx_pages_parent_id ON public.pages(parent_id);
CREATE INDEX idx_pages_type ON public.pages(type);

-- Mettre à jour les politiques RLS pour inclure les dossiers
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can insert their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON public.pages;

-- Recréer les politiques RLS
CREATE POLICY "Users can view their own pages and folders"
ON public.pages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pages and folders"
ON public.pages FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);

CREATE POLICY "Users can update their own pages and folders"
ON public.pages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages and folders"
ON public.pages FOR DELETE
USING (auth.uid() = user_id);

-- Ajouter une contrainte pour éviter les cycles dans la hiérarchie
-- (Un dossier ne peut pas être son propre parent)
ALTER TABLE public.pages
ADD CONSTRAINT check_no_self_parent CHECK (id != parent_id);

