import { Router } from 'express';
import {
    getUserSubscriptionsController,
    createSubscriptionController,
    deleteSubscriptionController
} from '../controllers/subscriptionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes d'abonnement nécessitent une authentification
router.use(authMiddleware);

// GET /subscriptions - Récupérer les abonnements de l'utilisateur connecté
router.get('/', getUserSubscriptionsController);

// POST /subscriptions - Créer un nouvel abonnement
router.post('/', createSubscriptionController);

// DELETE /subscriptions/:institution_id - Supprimer un abonnement
router.delete('/:institution_id', deleteSubscriptionController);

export default router;


