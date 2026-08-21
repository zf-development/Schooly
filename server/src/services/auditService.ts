// Service d'audit pour Schooly
// - Logging automatique de toutes les actions CRUD
// - Traçabilité des modifications et suppressions
// - Historique complet des actions utilisateurs

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase côté serveur
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Créer le client Supabase avec la clé de service
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// Types pour l'audit
export interface AuditLogData {
    action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'ACCESS_DENIED';
    table_name: string;
    record_id?: string;
    user_id?: string;
    user_email?: string;
    user_institution_id?: string;
    old_values?: any;
    new_values?: any;
    changes_summary?: string;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    additional_context?: any;
    error_message?: string;
    success?: boolean;
}

export interface RequestContext {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    headers?: any;
    params?: any;
    query?: any;
}

// Service d'audit principal
export class AuditService {

    /**
     * Créer un log d'audit
     */
    static async createLog(auditData: AuditLogData): Promise<string | null> {
        try {
            const { data, error } = await supabase
                .rpc('create_audit_log', {
                    p_action_type: auditData.action_type,
                    p_table_name: auditData.table_name,
                    p_record_id: auditData.record_id,
                    p_user_id: auditData.user_id,
                    p_user_email: auditData.user_email,
                    p_user_institution_id: auditData.user_institution_id,
                    p_old_values: auditData.old_values ? JSON.stringify(auditData.old_values) : null,
                    p_new_values: auditData.new_values ? JSON.stringify(auditData.new_values) : null,
                    p_changes_summary: auditData.changes_summary,
                    p_ip_address: auditData.ip_address,
                    p_user_agent: auditData.user_agent,
                    p_session_id: auditData.session_id,
                    p_additional_context: auditData.additional_context ? JSON.stringify(auditData.additional_context) : null,
                    p_error_message: auditData.error_message,
                    p_success: auditData.success ?? true
                });

            if (error) {
                console.error('Erreur lors de la création du log d\'audit:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Erreur AuditService.createLog:', error);
            return null;
        }
    }

    /**
     * Logger la création d'un élément
     */
    static async logCreate(
        tableName: string,
        recordId: string,
        newValues: any,
        userId?: string,
        userEmail?: string,
        userInstitutionId?: string,
        context?: RequestContext,
        summary?: string
    ): Promise<void> {
        await this.createLog({
            action_type: 'CREATE',
            table_name: tableName,
            record_id: recordId,
            user_id: userId,
            user_email: userEmail,
            user_institution_id: userInstitutionId,
            new_values: newValues,
            changes_summary: summary || `Nouvel élément créé dans ${tableName}`,
            ip_address: context?.ip,
            user_agent: context?.userAgent,
            session_id: context?.sessionId,
            additional_context: {
                headers: context?.headers,
                params: context?.params,
                query: context?.query
            },
            success: true
        });
    }

    /**
     * Logger la modification d'un élément
     */
    static async logUpdate(
        tableName: string,
        recordId: string,
        oldValues: any,
        newValues: any,
        userId?: string,
        userEmail?: string,
        userInstitutionId?: string,
        context?: RequestContext,
        summary?: string
    ): Promise<void> {
        await this.createLog({
            action_type: 'UPDATE',
            table_name: tableName,
            record_id: recordId,
            user_id: userId,
            user_email: userEmail,
            user_institution_id: userInstitutionId,
            old_values: oldValues,
            new_values: newValues,
            changes_summary: summary || `Élément modifié dans ${tableName}`,
            ip_address: context?.ip,
            user_agent: context?.userAgent,
            session_id: context?.sessionId,
            additional_context: {
                headers: context?.headers,
                params: context?.params,
                query: context?.query
            },
            success: true
        });
    }

    /**
     * Logger la suppression d'un élément
     */
    static async logDelete(
        tableName: string,
        recordId: string,
        oldValues: any,
        userId?: string,
        userEmail?: string,
        userInstitutionId?: string,
        context?: RequestContext,
        summary?: string
    ): Promise<void> {
        await this.createLog({
            action_type: 'DELETE',
            table_name: tableName,
            record_id: recordId,
            user_id: userId,
            user_email: userEmail,
            user_institution_id: userInstitutionId,
            old_values: oldValues,
            changes_summary: summary || `Élément supprimé de ${tableName}`,
            ip_address: context?.ip,
            user_agent: context?.userAgent,
            session_id: context?.sessionId,
            additional_context: {
                headers: context?.headers,
                params: context?.params,
                query: context?.query
            },
            success: true
        });
    }

    /**
     * Logger un accès refusé
     */
    static async logAccessDenied(
        tableName: string,
        userId?: string,
        userEmail?: string,
        userInstitutionId?: string,
        context?: RequestContext,
        reason?: string
    ): Promise<void> {
        await this.createLog({
            action_type: 'ACCESS_DENIED',
            table_name: tableName,
            user_id: userId,
            user_email: userEmail,
            user_institution_id: userInstitutionId,
            changes_summary: reason || `Accès refusé à ${tableName}`,
            ip_address: context?.ip,
            user_agent: context?.userAgent,
            session_id: context?.sessionId,
            additional_context: {
                headers: context?.headers,
                params: context?.params,
                query: context?.query
            },
            success: false
        });
    }

    /**
     * Logger une erreur
     */
    static async logError(
        tableName: string,
        error: any,
        userId?: string,
        userEmail?: string,
        userInstitutionId?: string,
        context?: RequestContext,
        action?: string
    ): Promise<void> {
        await this.createLog({
            action_type: 'ACCESS_DENIED', // Utiliser ACCESS_DENIED pour les erreurs
            table_name: tableName,
            user_id: userId,
            user_email: userEmail,
            user_institution_id: userInstitutionId,
            changes_summary: `Erreur lors de ${action || 'l\'opération'}`,
            ip_address: context?.ip,
            user_agent: context?.userAgent,
            session_id: context?.sessionId,
            additional_context: {
                headers: context?.headers,
                params: context?.params,
                query: context?.query,
                error: error?.message || error?.toString()
            },
            error_message: error?.message || error?.toString(),
            success: false
        });
    }

    /**
     * Récupérer les logs d'audit pour un utilisateur
     */
    static async getUserAuditLogs(
        userId: string,
        limit: number = 100,
        offset: number = 0
    ): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Erreur lors de la récupération des logs d\'audit:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Erreur AuditService.getUserAuditLogs:', error);
            return [];
        }
    }

    /**
     * Récupérer les logs d'audit pour une institution
     */
    static async getInstitutionAuditLogs(
        institutionId: string,
        limit: number = 100,
        offset: number = 0
    ): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('user_institution_id', institutionId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Erreur lors de la récupération des logs d\'audit:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Erreur AuditService.getInstitutionAuditLogs:', error);
            return [];
        }
    }

    /**
     * Récupérer les logs d'audit pour un enregistrement spécifique
     */
    static async getRecordAuditLogs(
        tableName: string,
        recordId: string,
        limit: number = 100,
        offset: number = 0
    ): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('table_name', tableName)
                .eq('record_id', recordId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Erreur lors de la récupération des logs d\'audit:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Erreur AuditService.getRecordAuditLogs:', error);
            return [];
        }
    }
}

// Fonctions utilitaires pour l'extraction du contexte
export const extractRequestContext = (req: any): RequestContext => {
    return {
        ip: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
        sessionId: req.session?.id,
        headers: req.headers,
        params: req.params,
        query: req.query
    };
};

