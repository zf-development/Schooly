// Routes pour l'audit et la consultation des logs
// - GET /api/audit/user - Logs d'audit de l'utilisateur connecté
// - GET /api/audit/institution - Logs d'audit de l'institution
// - GET /api/audit/record/:tableName/:recordId - Logs d'audit d'un enregistrement
// - GET /api/audit/summary - Résumé des actions d'audit

import { Router } from 'express';
import {
    getUserAuditLogs,
    getInstitutionAuditLogs,
    getRecordAuditLogs,
    getAuditSummary
} from '../controllers/auditController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes d'audit nécessitent une authentification
router.use(authMiddleware);

// Récupérer les logs d'audit de l'utilisateur connecté
router.get('/user', getUserAuditLogs);

// Récupérer les logs d'audit de l'institution de l'utilisateur
router.get('/institution', getInstitutionAuditLogs);

// Récupérer les logs d'audit d'un enregistrement spécifique
router.get('/record/:tableName/:recordId', getRecordAuditLogs);

// Récupérer un résumé des actions d'audit
router.get('/summary', getAuditSummary);

export default router;

