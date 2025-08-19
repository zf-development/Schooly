// Routes liées aux posts
// - Définir les routes CRUD pour les posts
// - Appliquer les middlewares d'authentification
// - Connecter aux contrôleurs

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getPosts, createPost, updatePost, deletePost } from '../controllers/feedController';

const router = Router();

router.get('/', authMiddleware, getPosts);
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

export default router;
