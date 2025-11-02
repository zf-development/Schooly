-- Migration pour créer la table pages
-- Créé le 29/09/2025

-- Créer la table pages
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    folder_id UUID,
    user_id UUID NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter les indexes pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_folder_id ON pages(folder_id);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages(updated_at);

-- Activer RLS (Row Level Security)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres pages
CREATE POLICY "Users can view own pages" ON pages
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Politique pour que les utilisateurs puissent créer leurs propres pages
CREATE POLICY "Users can insert own pages" ON pages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Politique pour que les utilisateurs puissent modifier leurs propres pages
CREATE POLICY "Users can update own pages" ON pages
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Politique pour que les utilisateurs puissent supprimer leurs propres pages
CREATE POLICY "Users can delete own pages" ON pages
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_pages_updated_at 
    BEFORE UPDATE ON pages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

