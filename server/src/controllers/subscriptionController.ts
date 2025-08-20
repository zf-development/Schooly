import { Request, Response } from 'express';
import {
    getUserSubscriptions,
    createSubscription,
    deleteSubscription,
    getInstitutionDetails
} from '../services/supabaseService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        institution_id: string;
        name: string;
        email: string;
    };
}

// GET /subscriptions - Récupérer les abonnements de l'utilisateur connecté
export const getUserSubscriptionsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const subscriptions = await getUserSubscriptions(req.user.id);

        if (subscriptions === null) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des abonnements' });
        }

        // Enrichir chaque abonnement avec les détails de l'institution
        const enrichedSubscriptions = await Promise.all(subscriptions.map(async (subscription) => {
            try {
                const institutionDetails = await getInstitutionDetails(subscription.institution_id);
                return {
                    ...subscription,
                    institution: institutionDetails || {
                        id: subscription.institution_id,
                        name: `Établissement ${subscription.institution_id}`,
                        logoUrl: undefined
                    }
                };
            } catch (error) {
                return {
                    ...subscription,
                    institution: {
                        id: subscription.institution_id,
                        name: `Établissement ${subscription.institution_id}`,
                        logoUrl: undefined
                    }
                };
            }
        }));

        res.status(200).json({
            subscriptions: enrichedSubscriptions,
            total: enrichedSubscriptions.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des abonnements' });
    }
};

// POST /subscriptions - Créer un nouvel abonnement
export const createSubscriptionController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { institution_id } = req.body;

        // Validation des données
        if (!institution_id) {
            return res.status(400).json({ error: 'ID de l\'institution requis' });
        }

        if (typeof institution_id !== 'string') {
            return res.status(400).json({ error: 'ID de l\'institution doit être une chaîne de caractères' });
        }

        // Vérifier que l'utilisateur ne suit pas déjà cette institution
        const existingSubscriptions = await getUserSubscriptions(req.user.id);
        if (existingSubscriptions && existingSubscriptions.some(sub => sub.institution_id === institution_id)) {
            return res.status(409).json({ error: 'Vous suivez déjà cette institution' });
        }

        const subscription = await createSubscription(req.user.id, institution_id);

        if (!subscription) {
            return res.status(500).json({ error: 'Erreur lors de la création de l\'abonnement' });
        }

        res.status(201).json({
            message: 'Abonnement créé avec succès',
            subscription
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur lors de la création de l\'abonnement' });
    }
};

// DELETE /subscriptions/:institution_id - Supprimer un abonnement
export const deleteSubscriptionController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { institution_id } = req.params;

        if (!institution_id) {
            return res.status(400).json({ error: 'ID de l\'institution requis' });
        }

        // Vérifier que l'utilisateur suit bien cette institution
        const existingSubscriptions = await getUserSubscriptions(req.user.id);
        if (!existingSubscriptions || !existingSubscriptions.some(sub => sub.institution_id === institution_id)) {
            return res.status(404).json({ error: 'Abonnement non trouvé' });
        }

        const success = await deleteSubscription(req.user.id, institution_id);

        if (!success) {
            return res.status(500).json({ error: 'Erreur lors de la suppression de l\'abonnement' });
        }

        res.status(200).json({
            message: 'Abonnement supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'abonnement' });
    }
};


