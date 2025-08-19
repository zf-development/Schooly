import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase côté serveur
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Créer le client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interface étendue pour inclure l'utilisateur authentifié
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        institution_id: string;
        name: string;
        email: string;
    };
}

// Vraie validation JWT avec Supabase
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token d\'authentification manquant' });
        }

        const token = authHeader.split(' ')[1];

        // Valider le token avec Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Token invalide ou expiré' });
        }

        // Récupérer les détails de l'utilisateur depuis notre table custom
        const { data: userDetails, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError || !userDetails) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }

        // Définir l'utilisateur authentifié
        req.user = {
            id: userDetails.id,
            institution_id: userDetails.institution_id,
            name: userDetails.name || user.email || 'Utilisateur',
            email: userDetails.email
        };

        next();
    } catch (error) {
        res.status(401).json({ error: 'Erreur d\'authentification' });
    }
};
