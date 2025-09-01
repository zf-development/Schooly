import { Router } from 'express';
import { 
    getCurrentUser, 
    updateCurrentUser, 
    uploadAvatar, 
    getUserStatsController, 
    getUserBadgesController 
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes utilisateur nécessitent une authentification
router.use(authMiddleware);

// GET /users/me - Récupérer le profil de l'utilisateur connecté
router.get('/me', getCurrentUser);

// PATCH /users/me - Mettre à jour le profil de l'utilisateur connecté
router.patch('/me', updateCurrentUser);

// POST /users/avatar - Upload d'un avatar
router.post('/avatar', uploadAvatar);

// GET /users/stats - Récupérer les statistiques de l'utilisateur
router.get('/stats', getUserStatsController);

// GET /users/badges - Récupérer les badges de l'utilisateur
router.get('/badges', getUserBadgesController);

export default router;


