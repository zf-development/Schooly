// Routes pour la connexion / inscription
// - Définir les routes d'authentification
// - Appliquer les middlewares de validation
// - Connecter aux contrôleurs

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { login, register, logout, getCurrentUser } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
