import { Request, Response } from 'express';
import { getAllSupabaseInstitutions, getSupabaseInstitutionById } from '../services/supabaseService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllInstitutions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const institutions = await getAllSupabaseInstitutions();

        res.status(200).json({
            success: true,
            data: institutions,
            message: institutions.length > 0 ? 'Établissements récupérés avec succès' : 'Aucun établissement trouvé'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des établissements'
        });
    }
};

// Récupérer un établissement par son ID
export const getInstitutionById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID de l\'établissement requis'
            });
        }

        const institution = await getSupabaseInstitutionById(id);

        if (institution) {
            res.status(200).json({
                success: true,
                data: institution,
                message: 'Établissement récupéré avec succès'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Établissement non trouvé'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de l\'établissement'
        });
    }
};
