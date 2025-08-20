import express from 'express';
import { getAllInstitutions, getInstitutionById } from '../controllers/institutionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Récupérer tous les établissements
router.get('/', getAllInstitutions);

// Récupérer un établissement par son ID
router.get('/:id', getInstitutionById);

export default router;
