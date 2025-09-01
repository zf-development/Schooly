import { Request, Response } from 'express';
import { getUserById, updateUser, getUserStats, getUserBadges } from '../services/supabaseService';

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

        // Récupérer les statistiques et badges
        const stats = await getUserStats(req.user.id);
        const badges = await getUserBadges(req.user.id);

        res.status(200).json({
            id: user.id,
            email: user.email,
            institution_id: user.institution_id,
            display_name: user.display_name || 'Utilisateur',
            full_name: user.full_name,
            avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            inscription_date: user.created_at,
            file_number: user.file_number || `U${user.id.slice(0, 8)}`,
            school: user.school,
            group_number: user.group_number,
            education_level: user.education_level,
            posts_count: stats?.posts_count || 0,
            xp_points: stats?.xp_points || 0,
            preferred_tags: user.preferred_tags || [],
            academic_projects: user.academic_projects || []
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération du profil' });
    }
};

// PATCH /users/me - Mettre à jour le profil de l'utilisateur connecté
export const updateCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { 
            display_name, 
            avatar_url, 
            full_name, 
            school, 
            group_number, 
            education_level,
            preferred_tags,
            academic_projects
        } = req.body;

        // Validation des données
        if (display_name !== undefined && (typeof display_name !== 'string' || display_name.trim().length === 0)) {
            return res.status(400).json({ error: 'Le nom d\'affichage ne peut pas être vide' });
        }

        if (avatar_url !== undefined && (typeof avatar_url !== 'string' || avatar_url.trim().length === 0)) {
            return res.status(400).json({ error: 'L\'URL de l\'avatar ne peut pas être vide' });
        }

        if (full_name !== undefined && (typeof full_name !== 'string' || full_name.trim().length === 0)) {
            return res.status(400).json({ error: 'Le nom complet ne peut pas être vide' });
        }

        if (school !== undefined && (typeof school !== 'string' || school.trim().length === 0)) {
            return res.status(400).json({ error: 'Le nom de l\'école ne peut pas être vide' });
        }

        if (group_number !== undefined && (typeof group_number !== 'string' || group_number.trim().length === 0)) {
            return res.status(400).json({ error: 'Le numéro de groupe ne peut pas être vide' });
        }

        if (education_level !== undefined && !['secondaire', 'collégial', 'universitaire'].includes(education_level)) {
            return res.status(400).json({ error: 'Niveau d\'études invalide' });
        }

        if (preferred_tags !== undefined && (!Array.isArray(preferred_tags) || preferred_tags.some(tag => typeof tag !== 'string'))) {
            return res.status(400).json({ error: 'Les tags préférés doivent être un tableau de chaînes' });
        }

        if (academic_projects !== undefined && (!Array.isArray(academic_projects) || academic_projects.some(project => typeof project !== 'string'))) {
            return res.status(400).json({ error: 'Les projets académiques doivent être un tableau de chaînes' });
        }

        const updateData: any = {};

        if (display_name !== undefined) updateData.display_name = display_name.trim();
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url.trim();
        if (full_name !== undefined) updateData.full_name = full_name.trim();
        if (school !== undefined) updateData.school = school.trim();
        if (group_number !== undefined) updateData.group_number = group_number.trim();
        if (education_level !== undefined) updateData.education_level = education_level;
        if (preferred_tags !== undefined) updateData.preferred_tags = preferred_tags;
        if (academic_projects !== undefined) updateData.academic_projects = academic_projects;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
        }

        const updatedUser = await updateUser(req.user.id, updateData);

        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil' });
    }
};

// POST /users/avatar - Upload d'un avatar
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Ici vous pouvez implémenter la logique d'upload de fichier
        // Pour l'instant, on simule un upload réussi
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.id}&t=${Date.now()}`;

        // Mettre à jour l'utilisateur avec la nouvelle URL d'avatar
        const updatedUser = await updateUser(req.user.id, { avatar_url: avatarUrl });

        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            message: 'Avatar mis à jour avec succès',
            avatar_url: avatarUrl
        });
    } catch (error) {
        console.error('Erreur lors de l\'upload de l\'avatar:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'upload de l\'avatar' });
    }
};

// GET /users/stats - Récupérer les statistiques de l'utilisateur
export const getUserStatsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const stats = await getUserStats(req.user.id);

        res.status(200).json(stats || {
            posts_count: 0,
            xp_points: 0,
            level: 1,
            progress_to_next_level: 0
    }); 
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
    }
};

// GET /users/badges - Récupérer les badges de l'utilisateur
export const getUserBadgesController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const badges = await getUserBadges(req.user.id);

        res.status(200).json(badges || []);
    } catch (error) {
        console.error('Erreur lors de la récupération des badges:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des badges' });
    }
};


