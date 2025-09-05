// TODO: Logique d'authentification
// - POST /api/auth/login - Connexion utilisateur
// - POST /api/auth/logout - Déconnexion utilisateur
// - GET /api/auth/me - Récupérer l'utilisateur connecté
// - POST /api/auth/register - Inscription utilisateur

import { Request, Response } from 'express';
import { createUser, getUserById, authenticateUser, getSupabaseInstitutionById } from '../services/supabaseService';

// Interface étendue pour inclure l'utilisateur authentifié
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        institution_id: string;
        name: string;
        email: string;
    };
}

// TODO: Connexion utilisateur
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation des inputs
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email et mot de passe requis',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Validation format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Format d\'email invalide',
                code: 'INVALID_EMAIL_FORMAT'
            });
        }

        // Validation longueur password
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Le mot de passe doit contenir au moins 6 caractères',
                code: 'PASSWORD_TOO_SHORT'
            });
        }

        // Authentification avec Supabase
        const authResult = await authenticateUser(email, password);

        if (!authResult.success) {
            return res.status(401).json({
                error: authResult.error || 'Identifiants invalides',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Connexion réussie - renvoyer le token et les infos utilisateur
        res.status(200).json({
            message: 'Connexion réussie',
            token: authResult.token,
            user: authResult.user
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur serveur lors de la connexion',
            code: 'SERVER_ERROR'
        });
    }
};

// Déconnexion utilisateur
export const logout = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non authentifié'
            });
        }

        // Log de déconnexion pour audit
        console.log(`Utilisateur ${user.email} (${user.id}) s'est déconnecté`);

        // Ici on pourrait ajouter une logique de blacklist des tokens
        // Pour l'instant, on se contente de confirmer la déconnexion

        res.status(200).json({
            success: true,
            message: 'Déconnexion réussie',
            user_id: user.id
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la déconnexion'
        });
    }
};

// TODO: Récupérer l'utilisateur connecté
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        // Récupérer les détails complets de l'utilisateur depuis Supabase
        const userDetails = await getUserById(user.id);

        if (!userDetails) {
            return res.status(404).json({
                error: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        // Récupérer les informations de l'institution si l'utilisateur en a une
        let institution = null;
        if (userDetails.institution_id) {
            institution = await getSupabaseInstitutionById(userDetails.institution_id);
        }

        res.status(200).json({
            user: {
                id: userDetails.id,
                email: userDetails.email,
                institution_id: userDetails.institution_id,
                display_name: userDetails.display_name,
                avatar_url: userDetails.avatar_url,
                created_at: userDetails.created_at,
                institution: institution ? {
                    id: institution.id,
                    name: institution.name
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur serveur lors de la récupération de l\'utilisateur',
            code: 'SERVER_ERROR'
        });
    }
};

// TODO: Inscription utilisateur
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validation des inputs
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Email, mot de passe et nom requis',
                code: 'MISSING_FIELDS'
            });
        }

        // Validation format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Format d\'email invalide',
                code: 'INVALID_EMAIL_FORMAT'
            });
        }

        // Validation longueur password
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Le mot de passe doit contenir au moins 6 caractères',
                code: 'PASSWORD_TOO_SHORT'
            });
        }

        // Validation nom
        if (name.trim().length < 2) {
            return res.status(400).json({
                error: 'Le nom doit contenir au moins 2 caractères',
                code: 'NAME_TOO_SHORT'
            });
        }

        // TODO: Récupérer l'institution_id depuis le body ou une valeur par défaut
        // Pour l'instant, on utilise une valeur simulée
        const institution_id = '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'; // MGR Parent - À remplacer par la vraie logique

        // Créer l'utilisateur dans Supabase
        const newUser = await createUser({
            email,
            password,
            institution_id
        });

        if (!newUser) {
            return res.status(500).json({
                error: 'Erreur lors de la création de l\'utilisateur',
                code: 'DATABASE_ERROR'
            });
        }

        res.status(201).json({
            message: 'Inscription réussie',
            user: {
                id: newUser.id,
                email: newUser.email,
                institution_id: newUser.institution_id
            }
        });
    } catch (error: any) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
            return res.status(409).json({
                error: 'Un utilisateur avec cet email existe déjà',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }

        res.status(500).json({
            error: 'Erreur lors de l\'inscription',
            code: 'SERVER_ERROR'
        });
    }
};
