// TODO: Fonctions pour uniformiser les réponses
// - Réponses de succès standardisées
// - Réponses d'erreur standardisées
// - Codes de statut HTTP

import { Response } from 'express';

// TODO: Interface pour les réponses de succès
interface SuccessResponse {
    success: true;
    data: any;
    message?: string;
}

// TODO: Interface pour les réponses d'erreur
interface ErrorResponse {
    success: false;
    error: string;
    details?: any;
}

// TODO: Fonction pour envoyer une réponse de succès
export const sendSuccess = (
    res: Response,
    data: any,
    message?: string,
    statusCode: number = 200
) => {
    const response: SuccessResponse = {
        success: true,
        data,
        message
    };
    res.status(statusCode).json(response);
};

// TODO: Fonction pour envoyer une réponse d'erreur
export const sendError = (
    res: Response,
    error: string,
    details?: any,
    statusCode: number = 500
) => {
    const response: ErrorResponse = {
        success: false,
        error,
        details
    };
    res.status(statusCode).json(response);
};

// TODO: Fonction pour envoyer une réponse de validation d'erreur
export const sendValidationError = (
    res: Response,
    errors: any
) => {
    sendError(res, 'Données de validation invalides', errors, 400);
};

// TODO: Fonction pour envoyer une réponse d'authentification échouée
export const sendAuthError = (
    res: Response,
    message: string = 'Authentification requise'
) => {
    sendError(res, message, null, 401);
};
