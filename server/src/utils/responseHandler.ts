// TODO: Fonctions pour uniformiser les réponses
// - Réponses de succès standardisées
// - Réponses d'erreur standardisées
// - Codes de statut HTTP

import { Response } from 'express';

/**
 * Fonction utilitaire pour gérer les réponses HTTP de manière cohérente
 * @param res - Objet Response d'Express
 * @param statusCode - Code de statut HTTP
 * @param message - Message de réponse
 * @param data - Données optionnelles à inclure dans la réponse
 */
export const handleResponse = (
    res: Response,
    statusCode: number,
    message: string,
    data?: any
): void => {
    const response: any = {
        success: statusCode >= 200 && statusCode < 300,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== undefined) {
        response.data = data;
    }

    res.status(statusCode).json(response);
};

/**
 * Fonction utilitaire pour gérer les erreurs de manière cohérente
 * @param res - Objet Response d'Express
 * @param statusCode - Code de statut HTTP d'erreur
 * @param message - Message d'erreur
 * @param error - Erreur optionnelle à inclure dans la réponse
 */
export const handleError = (
    res: Response,
    statusCode: number,
    message: string,
    error?: any
): void => {
    const response: any = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }

    res.status(statusCode).json(response);
};
