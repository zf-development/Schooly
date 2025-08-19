// TODO: Constantes globales
// - Configuration de l'application
// - URLs des API
// - Messages d'erreur
// - Limites et contraintes

// TODO: Configuration de l'API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// TODO: Configuration Supabase
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// TODO: Messages d'erreur
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erreur de connexion',
    AUTH_ERROR: 'Erreur d\'authentification',
    VALIDATION_ERROR: 'Données invalides',
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite'
};

// TODO: Limites de l'application
export const LIMITS = {
    MAX_POST_LENGTH: 1000,
    MAX_TITLE_LENGTH: 100,
    MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

// TODO: Types d'institutions
export const INSTITUTION_TYPES = {
    SCHOOL: 'school',
    UNIVERSITY: 'university',
    COLLEGE: 'college'
} as const;
