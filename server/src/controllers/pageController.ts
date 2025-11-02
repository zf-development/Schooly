import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { createUserPage, getUserPages, getUserPageById, updateUserPage, deleteUserPage } from '../services/supabaseService';

export const createPage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const pageData = {
            ...req.body,
            user_id: req.user.id,
            created_by: req.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            type: req.body.type || 'page' // Par défaut 'page' si non spécifié
        };

        const page = await createUserPage(pageData);
        if (page === null) {
            return res.status(500).json({ error: 'Erreur lors de la création de la page' });
        }

        res.status(201).json(page);
    } catch (error) {
        console.error('Erreur lors de la création de la page:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la page' });
    }
};

// Récupérer toutes les pages de l'utilisateur
export const getPages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const pages = await getUserPages(req.user.id);
        if (pages === null) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des pages' });
        }

        res.status(200).json(pages);
    } catch (error) {
        console.error('Erreur lors de la récupération des pages:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des pages' });
    }
};

// Récupérer une page spécifique
export const getPageById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const pageId = req.params.id;
        const page = await getUserPageById(req.user.id, pageId);

        if (page === null) {
            return res.status(404).json({ error: 'Page non trouvée' });
        }

        res.status(200).json(page);
    } catch (error) {
        console.error('Erreur lors de la récupération de la page:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la page' });
    }
};

// Mettre à jour une page
export const updatePage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const pageId = req.params.id;

        // Vérifier que l'utilisateur possède la page avant de la mettre à jour
        const existingPage = await getUserPageById(req.user.id, pageId);
        if (existingPage === null) {
            return res.status(403).json({ error: 'Accès interdit : vous ne possédez pas cette page' });
        }

        const pageData = {
            ...req.body,
            updated_at: new Date().toISOString()
        };

        const page = await updateUserPage(pageId, pageData);
        if (page === null) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour de la page' });
        }

        res.status(200).json(page);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la page:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la page' });
    }
};

// Supprimer une page
export const deletePage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const pageId = req.params.id;

        // Vérifier que l'utilisateur possède la page avant de la supprimer
        const page = await getUserPageById(req.user.id, pageId);
        if (page === null) {
            return res.status(403).json({ error: 'Accès interdit : vous ne possédez pas cette page' });
        }

        const success = await deleteUserPage(pageId);

        if (!success) {
            return res.status(500).json({ error: 'Erreur lors de la suppression de la page' });
        }

        res.status(200).json({ message: 'Page supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la page:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la page' });
    }
};
