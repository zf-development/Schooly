-- Script pour adapter la table feeds à notre structure StudBud
-- À exécuter dans l'éditeur SQL de Supabase

-- ========================================
-- 1. VÉRIFICATION DE LA STRUCTURE ACTUELLE
-- ========================================

-- Voir la structure actuelle
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'feeds'
ORDER BY ordinal_position;

-- ========================================
-- 2. AJOUT DES COLONNES MANQUANTES
-- ========================================

-- Ajouter la colonne title
ALTER TABLE feeds 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Ajouter la colonne visibility
ALTER TABLE feeds 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

-- Ajouter la colonne updated_at
ALTER TABLE feeds 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================
-- 3. CONTRAINTES ET VALIDATIONS
-- ========================================

-- Contrainte pour visibility (public ou private)
ALTER TABLE feeds 
ADD CONSTRAINT feeds_visibility_check 
CHECK (visibility IN ('public', 'private'));

-- Contrainte pour title (non vide)
ALTER TABLE feeds 
ADD CONSTRAINT feeds_title_not_empty 
CHECK (title IS NOT NULL AND length(trim(title)) > 0);

-- Contrainte pour content (non vide)
ALTER TABLE feeds 
ADD CONSTRAINT feeds_content_not_empty 
CHECK (content IS NOT NULL AND length(trim(content)) > 0);

-- ========================================
-- 4. TRIGGER POUR updated_at
-- ========================================

-- Créer ou remplacer la fonction de mise à jour
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_feeds_updated_at ON feeds;
CREATE TRIGGER update_feeds_updated_at
    BEFORE UPDATE ON feeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. INDEX POUR LES PERFORMANCES
-- ========================================

-- Index sur institution_id pour le filtrage
CREATE INDEX IF NOT EXISTS idx_feeds_institution_id ON feeds(institution_id);

-- Index sur author_id pour les recherches par auteur
CREATE INDEX IF NOT EXISTS idx_feeds_author_id ON feeds(author_id);

-- Index sur visibility pour le filtrage
CREATE INDEX IF NOT EXISTS idx_feeds_visibility ON feeds(visibility);

-- Index sur created_at pour le tri chronologique
CREATE INDEX IF NOT EXISTS idx_feeds_created_at ON feeds(created_at);

-- ========================================
-- 6. VÉRIFICATION FINALE
-- ========================================

-- Vérifier la nouvelle structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'feeds'
ORDER BY ordinal_position;

-- Vérifier les contraintes
SELECT constraint_name, constraint_type, check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name LIKE 'feeds_%';

-- Vérifier les index
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'feeds';

