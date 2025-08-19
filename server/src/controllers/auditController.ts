// Contrôleur pour l'audit et la consultation des logs
// - Consultation des logs d'audit par utilisateur
// - Consultation des logs d'audit par institution
// - Consultation des logs d'audit par enregistrement

import { Request, Response } from 'express';
import { AuditService } from '../services/auditService';

// Interface étendue pour inclure l'utilisateur authentifié
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        institution_id: string;
        name: string;
        email: string;
    };
}

// Récupérer les logs d'audit de l'utilisateur connecté
export const getUserAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        // Paramètres de pagination
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        // Récupérer les logs d'audit de l'utilisateur
        const logs = await AuditService.getUserAuditLogs(user.id, limit, offset);

        res.status(200).json({
            logs: logs,
            user_id: user.id,
            total_logs: logs.length,
            pagination: {
                limit,
                offset,
                has_more: logs.length === limit
            },
            message: 'Logs d\'audit récupérés avec succès'
        });
    } catch (error) {
        console.error('Erreur getUserAuditLogs:', error);
        res.status(500).json({
            error: 'Erreur serveur lors de la récupération des logs d\'audit',
            code: 'SERVER_ERROR'
        });
    }
};

// Récupérer les logs d'audit de l'institution de l'utilisateur
export const getInstitutionAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        // Paramètres de pagination
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        // Récupérer les logs d'audit de l'institution
        const logs = await AuditService.getInstitutionAuditLogs(user.institution_id, limit, offset);

        res.status(200).json({
            logs: logs,
            institution_id: user.institution_id,
            total_logs: logs.length,
            pagination: {
                limit,
                offset,
                has_more: logs.length === limit
            },
            message: 'Logs d\'audit de l\'institution récupérés avec succès'
        });
    } catch (error) {
        console.error('Erreur getInstitutionAuditLogs:', error);
        res.status(500).json({
            error: 'Erreur serveur lors de la récupération des logs d\'audit',
            code: 'SERVER_ERROR'
        });
    }
};

// Récupérer les logs d'audit d'un enregistrement spécifique
export const getRecordAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const { tableName, recordId } = req.params;

        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        // Validation des paramètres
        if (!tableName || !recordId) {
            return res.status(400).json({
                error: 'Nom de table et ID d\'enregistrement requis',
                code: 'MISSING_PARAMETERS'
            });
        }

        // Paramètres de pagination
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        // Récupérer les logs d'audit de l'enregistrement
        const logs = await AuditService.getRecordAuditLogs(tableName, recordId, limit, offset);

        res.status(200).json({
            logs: logs,
            table_name: tableName,
            record_id: recordId,
            total_logs: logs.length,
            pagination: {
                limit,
                offset,
                has_more: logs.length === limit
            },
            message: 'Logs d\'audit de l\'enregistrement récupérés avec succès'
        });
    } catch (error) {
        console.error('Erreur getRecordAuditLogs:', error);
        res.status(500).json({
            error: 'Erreur serveur lors de la récupération des logs d\'audit',
            code: 'SERVER_ERROR'
        });
    }
};

// Récupérer un résumé des actions d'audit
export const getAuditSummary = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        // Récupérer les logs récents de l'utilisateur
        const userLogs = await AuditService.getUserAuditLogs(user.id, 50, 0);

        // Récupérer les logs récents de l'institution
        const institutionLogs = await AuditService.getInstitutionAuditLogs(user.institution_id, 50, 0);

        // Analyser les types d'actions
        const userActionCounts = userLogs.reduce((acc: any, log) => {
            acc[log.action_type] = (acc[log.action_type] || 0) + 1;
            return acc;
        }, {});

        const institutionActionCounts = institutionLogs.reduce((acc: any, log) => {
            acc[log.action_type] = (acc[log.action_type] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            summary: {
                user: {
                    total_actions: userLogs.length,
                    action_breakdown: userActionCounts,
                    recent_activity: userLogs.slice(0, 10)
                },
                institution: {
                    total_actions: institutionLogs.length,
                    action_breakdown: institutionActionCounts,
                    recent_activity: institutionLogs.slice(0, 10)
                }
            },
            message: 'Résumé d\'audit récupéré avec succès'
        });
    } catch (error) {
        console.error('Erreur getAuditSummary:', error);
        res.status(500).json({
            error: 'Erreur serveur lors de la récupération du résumé d\'audit',
            code: 'SERVER_ERROR'
        });
    }
};

