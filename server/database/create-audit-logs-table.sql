-- Script pour créer la table audit_logs pour StudBud
-- À exécuter dans l'éditeur SQL de Supabase

-- ========================================
-- 1. CRÉATION DE LA TABLE AUDIT_LOGS
-- ========================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informations sur l'action
    action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'READ', 'ACCESS_DENIED')),
    table_name TEXT NOT NULL,
    record_id UUID,
    
    -- Informations sur l'utilisateur
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    
    -- Informations sur l'action
    old_values JSONB, -- Valeurs avant modification (pour UPDATE)
    new_values JSONB, -- Valeurs après modification (pour CREATE/UPDATE)
    changes_summary TEXT, -- Résumé des changements
    
    -- Métadonnées
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Informations supplémentaires
    additional_context JSONB, -- Contexte supplémentaire (headers, params, etc.)
    error_message TEXT, -- Message d'erreur si l'action a échoué
    success BOOLEAN DEFAULT true
);

-- ========================================
-- 2. INDEX POUR LES PERFORMANCES
-- ========================================

-- Index sur l'action et la table pour les requêtes d'audit
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_table ON audit_logs(action_type, table_name);

-- Index sur l'utilisateur pour tracer les actions d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Index sur l'institution pour tracer les actions par institution
CREATE INDEX IF NOT EXISTS idx_audit_logs_institution ON audit_logs(user_institution_id);

-- Index sur le record_id pour tracer l'historique d'un élément
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- Index sur la date pour les requêtes temporelles
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Index sur le succès pour filtrer les actions réussies/échouées
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- ========================================
-- 3. CONTRAINTES ET VALIDATIONS
-- ========================================

-- Contrainte pour s'assurer qu'au moins une des valeurs est présente
ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_values_check 
CHECK (
    (action_type = 'CREATE' AND new_values IS NOT NULL) OR
    (action_type = 'UPDATE' AND (old_values IS NOT NULL OR new_values IS NOT NULL)) OR
    (action_type = 'DELETE' AND old_values IS NOT NULL) OR
    (action_type IN ('READ', 'ACCESS_DENIED'))
);

-- Contrainte pour s'assurer que record_id est présent pour les actions sur des enregistrements
ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_record_id_check 
CHECK (
    (action_type IN ('CREATE', 'UPDATE', 'DELETE') AND record_id IS NOT NULL) OR
    (action_type IN ('READ', 'ACCESS_DENIED'))
);

-- ========================================
-- 4. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour créer un log d'audit
CREATE OR REPLACE FUNCTION create_audit_log(
    p_action_type TEXT,
    p_table_name TEXT,
    p_record_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_user_email TEXT DEFAULT NULL,
    p_user_institution_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_changes_summary TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_additional_context JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        action_type,
        table_name,
        record_id,
        user_id,
        user_email,
        user_institution_id,
        old_values,
        new_values,
        changes_summary,
        ip_address,
        user_agent,
        session_id,
        additional_context,
        error_message,
        success
    ) VALUES (
        p_action_type,
        p_table_name,
        p_record_id,
        p_user_id,
        p_user_email,
        p_user_institution_id,
        p_old_values,
        p_new_values,
        p_changes_summary,
        p_ip_address,
        p_user_agent,
        p_session_id,
        p_additional_context,
        p_error_message,
        p_success
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. TRIGGERS AUTOMATIQUES (OPTIONNEL)
-- ========================================

-- Trigger pour logger automatiquement les modifications de la table feeds
CREATE OR REPLACE FUNCTION log_feeds_changes() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Log de création
        PERFORM create_audit_log(
            'CREATE',
            'feeds',
            NEW.id,
            NEW.author_id,
            NULL, -- email sera récupéré via le contrôleur
            NEW.institution_id,
            NULL,
            to_jsonb(NEW),
            'Nouveau post créé',
            NULL, -- IP sera récupéré via le contrôleur
            NULL, -- User agent sera récupéré via le contrôleur
            NULL
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log de modification
        PERFORM create_audit_log(
            'UPDATE',
            'feeds',
            NEW.id,
            NEW.author_id,
            NULL,
            NEW.institution_id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            'Post modifié',
            NULL,
            NULL,
            NULL
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Log de suppression
        PERFORM create_audit_log(
            'DELETE',
            'feeds',
            OLD.id,
            OLD.author_id,
            NULL,
            OLD.institution_id,
            to_jsonb(OLD),
            NULL,
            'Post supprimé',
            NULL,
            NULL,
            NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table feeds
DROP TRIGGER IF EXISTS trigger_log_feeds_changes ON feeds;
CREATE TRIGGER trigger_log_feeds_changes
    AFTER INSERT OR UPDATE OR DELETE ON feeds
    FOR EACH ROW
    EXECUTE FUNCTION log_feeds_changes();

-- ========================================
-- 6. VÉRIFICATION FINALE
-- ========================================

-- Vérifier que la table a été créée
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'audit_logs';

-- Vérifier les triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'audit_logs';

-- Message de confirmation
DO $$ 
BEGIN
    RAISE NOTICE 'Table audit_logs créée avec succès !';
    RAISE NOTICE 'Triggers automatiques configurés pour la table feeds';
    RAISE NOTICE 'Fonction create_audit_log disponible pour l''audit manuel';
END $$;

