import { Request, Response, NextFunction } from 'express';

// Interface étendue pour inclure l'utilisateur authentifié
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        institution_id: string;
        name: string;
        email: string;
    };
}

// TODO: Implémenter la vérification JWT/Supabase
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // TODO: Vérifier le token JWT dans les headers
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token d\'authentification manquant' });
        }

        // TODO: Valider le token avec Supabase
        // Pour l'instant, on simule une authentification réussie
        console.log('Auth middleware: token reçu, authentification simulée');

        // Simulation d'un utilisateur connecté (à remplacer par la vraie validation JWT)
        // On peut simuler différents utilisateurs selon le token
        const token = authHeader.split(' ')[1];

        if (token === 'school-a-token') {
            req.user = {
                id: 'user1',
                institution_id: 'school_a',
                name: 'Jean Dupont',
                email: 'jean@ecole-a.com'
            };
        } else if (token === 'school-b-token') {
            req.user = {
                id: 'user2',
                institution_id: 'school_b',
                name: 'Marie Martin',
                email: 'marie@ecole-b.com'
            };
        } else {
            // Token par défaut
            req.user = {
                id: 'user3',
                institution_id: 'school_a',
                name: 'Utilisateur Test',
                email: 'test@ecole-a.com'
            };
        }

        next();
    } catch (error) {
        console.error('Erreur dans authMiddleware:', error);
        res.status(401).json({ error: 'Token invalide' });
    }
};
