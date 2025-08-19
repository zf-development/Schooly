-- Script pour adapter la table feeds à notre structure StudBud (Version sécurisée)
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
-- 2. AJOUT DES COLONNES MANQUANTES (SÉCURISÉ)
-- ========================================

-- Ajouter la colonne title si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feeds' AND column_name = 'title') THEN
        ALTER TABLE feeds ADD COLUMN title TEXT;
        RAISE NOTICE 'Colonne title ajoutée';
    ELSE
        RAISE NOTICE 'Colonne title existe déjà';
    END IF;
END $$;

-- Ajouter la colonne visibility si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feeds' AND column_name = 'visibility') THEN
        ALTER TABLE feeds ADD COLUMN visibility TEXT DEFAULT 'public';
        RAISE NOTICE 'Colonne visibility ajoutée';
    ELSE
        RAISE NOTICE 'Colonne visibility existe déjà';
    END IF;
END $$;

-- Ajouter la colonne updated_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feeds' AND column_name = 'updated_at') THEN
        ALTER TABLE feeds ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà';
    END IF;
END $$;

-- ========================================
-- 3. CONTRAINTES ET VALIDATIONS (SÉCURISÉES)
-- ========================================

-- Contrainte pour visibility (public ou private)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'feeds_visibility_check') THEN
        ALTER TABLE feeds ADD CONSTRAINT feeds_visibility_check CHECK (visibility IN ('public', 'private'));
        RAISE NOTICE 'Contrainte feeds_visibility_check ajoutée';
    ELSE
        RAISE NOTICE 'Contrainte feeds_visibility_check existe déjà';
    END IF;
END $$;

-- Contrainte pour title (non vide)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'feeds_title_not_empty') THEN
        ALTER TABLE feeds ADD CONSTRAINT feeds_title_not_empty CHECK (title IS NOT NULL AND length(trim(title)) > 0);
        RAISE NOTICE 'Contrainte feeds_title_not_empty ajoutée';
    ELSE
        RAISE NOTICE 'Contrainte feeds_title_not_empty existe déjà';
    END IF;
END $$;

-- Contrainte pour content (non vide)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'feeds_content_not_empty') THEN
        ALTER TABLE feeds ADD CONSTRAINT feeds_content_not_empty CHECK (content IS NOT NULL AND length(trim(content)) > 0);
        RAISE NOTICE 'Contrainte feeds_content_not_empty ajoutée';
    ELSE
        RAISE NOTICE 'Contrainte feeds_content_not_empty existe déjà';
    END IF;
END $$;

-- ========================================
-- 4. TRIGGER POUR updated_at (SÉCURISÉ)
-- ========================================

-- Créer ou remplacer la fonction de mise à jour
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at (supprimer d'abord s'il existe)
DROP TRIGGER IF EXISTS update_feeds_updated_at ON feeds;
CREATE TRIGGER update_feeds_updated_at
    BEFORE UPDATE ON feeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Message de confirmation pour le trigger
DO $$ 
BEGIN
    RAISE NOTICE 'Trigger update_feeds_updated_at créé/mis à jour';
END $$;

-- ========================================
-- 5. INDEX POUR LES PERFORMANCES (SÉCURISÉS)
-- ========================================

-- Index sur institution_id pour le filtrage
CREATE INDEX IF NOT EXISTS idx_feeds_institution_id ON feeds(institution_id);

-- Index sur author_id pour les recherches par auteur
CREATE INDEX IF NOT EXISTS idx_feeds_author_id ON feeds(author_id);

-- Index sur visibility pour le filtrage
CREATE INDEX IF NOT EXISTS idx_feeds_visibility ON feeds(visibility);

-- Index sur created_at pour le tri chronologique
CREATE INDEX IF NOT EXISTS idx_feeds_created_at ON feeds(created_at);

-- Message de confirmation pour les index
DO $$ 
BEGIN
    RAISE NOTICE 'Index de performance créés/vérifiés';
END $$;

-- ========================================
-- 6. VÉRIFICATION FINALE
-- ========================================

-- Vérifier la nouvelle structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'feeds'
ORDER BY ordinal_position;

-- Vérifier les contraintes (version corrigée)
SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name LIKE 'feeds_%';

-- Vérifier les index
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'feeds';

-- Message de confirmation final
DO $$ 
BEGIN
    RAISE NOTICE 'Vérification terminée - Table feeds adaptée avec succès !';
END $$;
