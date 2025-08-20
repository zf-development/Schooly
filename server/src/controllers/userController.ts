import { Request, Response } from 'express';
import { getUserById, updateUser } from '../services/supabaseService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        institution_id: string;
        name: string;
        email: string;
    };
}

// GET /users/me - Récupérer les informations de l'utilisateur connecté
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            id: user.id,
            email: user.email,
            institution_id: user.institution_id,
            display_name: user.display_name || 'Utilisateur',
            avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur lors de la récupération du profil' });
    }
};

// PATCH /users/me - Mettre à jour le profil de l'utilisateur connecté
export const updateCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { display_name, avatar_url } = req.body;

        // Validation des données
        if (display_name !== undefined && (typeof display_name !== 'string' || display_name.trim().length === 0)) {
            return res.status(400).json({ error: 'Le nom d\'affichage ne peut pas être vide' });
        }

        if (avatar_url !== undefined && (typeof avatar_url !== 'string' || avatar_url.trim().length === 0)) {
            return res.status(400).json({ error: 'L\'URL de l\'avatar ne peut pas être vide' });
        }

        const updateData: { display_name?: string; avatar_url?: string } = {};

        if (display_name !== undefined) {
            updateData.display_name = display_name.trim();
        }

        if (avatar_url !== undefined) {
            updateData.avatar_url = avatar_url.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
        }

        const updatedUser = await updateUser(req.user.id, updateData);

        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                institution_id: updatedUser.institution_id,
                display_name: updatedUser.display_name,
                avatar_url: updatedUser.avatar_url
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil' });
    }
};


