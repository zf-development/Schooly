import { Router } from 'express';
import { getCurrentUser, updateCurrentUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes utilisateur nécessitent une authentification
router.use(authMiddleware);

// GET /users/me - Récupérer le profil de l'utilisateur connecté
router.get('/me', getCurrentUser);

// PATCH /users/me - Mettre à jour le profil de l'utilisateur connecté
router.patch('/me', updateCurrentUser);

export default router;


