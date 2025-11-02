import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createPage, getPages, getPageById, updatePage, deletePage } from '../controllers/pageController';

const router = Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes pour les pages
router.get('/', getPages);
router.get('/:id', getPageById);
router.post('/', createPage);
router.put('/:id', updatePage);
router.delete('/:id', deletePage);

export default router;
