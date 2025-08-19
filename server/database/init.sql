-- Script d'initialisation de la base de données StudBud
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer l'enum pour les types d'institutions
CREATE TYPE institution_type AS ENUM ('university', 'college', 'high_school');

-- Créer l'enum pour la visibilité des posts
CREATE TYPE post_visibility AS ENUM ('public', 'private');

-- Table des institutions
CREATE TABLE institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type institution_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des utilisateurs
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des posts (feeds)
CREATE TABLE feeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    visibility post_visibility DEFAULT 'public',
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_institution_id ON users(institution_id);
CREATE INDEX idx_feeds_institution_id ON feeds(institution_id);
CREATE INDEX idx_feeds_author_id ON feeds(author_id);
CREATE INDEX idx_feeds_visibility ON feeds(visibility);
CREATE INDEX idx_feeds_created_at ON feeds(created_at DESC);

-- Contraintes de validation
ALTER TABLE feeds ADD CONSTRAINT check_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 100);
ALTER TABLE feeds ADD CONSTRAINT check_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 2000);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feeds_updated_at BEFORE UPDATE ON feeds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer des données de test
INSERT INTO institutions (name, type) VALUES
    ('Université de Montréal', 'university'),
    ('Collège de Maisonneuve', 'college'),
    ('École secondaire Saint-Laurent', 'high_school');

-- Insérer des utilisateurs de test (remplacer les UUIDs par de vrais IDs)
-- INSERT INTO users (email, name, institution_id) VALUES
--     ('jean@umontreal.ca', 'Jean Dupont', (SELECT id FROM institutions WHERE name = 'Université de Montréal')),
--     ('marie@maisonneuve.ca', 'Marie Martin', (SELECT id FROM institutions WHERE name = 'Collège de Maisonneuve'));

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;

-- Politiques pour les institutions (lecture publique)
CREATE POLICY "Institutions are viewable by everyone" ON institutions
    FOR SELECT USING (true);

-- Politiques pour les utilisateurs (lecture publique, modification par l'utilisateur lui-même)
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les feeds (lecture selon la visibilité et l'institution)
CREATE POLICY "Public posts are viewable by everyone" ON feeds
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Private posts are viewable by institution members" ON feeds
    FOR SELECT USING (
        visibility = 'private' AND 
        institution_id IN (
            SELECT institution_id FROM users WHERE id = auth.uid()
        )
    );

-- Politiques pour la création/modification des posts
CREATE POLICY "Users can create posts in their institution" ON feeds
    FOR INSERT WITH CHECK (
        institution_id IN (
            SELECT institution_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own posts" ON feeds
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON feeds
    FOR DELETE USING (author_id = auth.uid());

