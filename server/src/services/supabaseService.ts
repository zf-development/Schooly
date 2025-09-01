// TODO: Appels à Supabase depuis le back
// - Initialiser le client Supabase côté serveur
// - Fonctions pour interagir avec la base de données
// - Gestion des erreurs Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase côté serveur
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Créer le client Supabase avec la clé de service
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// Interfaces TypeScript pour la base de données
interface User {
    id: string;
    email: string;
    institution_id: string;
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
    file_number?: string;
    school?: string;
    group_number?: string;
    education_level?: string;
    preferred_tags?: string[];
    academic_projects?: string[];
    created_at: string;
}

interface Institution {
    id: string;
    name: string;
    type: 'university' | 'college' | 'high_school';
    is_active: boolean;
    created_at: string;
}

interface FeedPost {
    id: string;
    title: string;
    content: string;
    visibility: string;
    author_id: string;
    institution_id: string;
    created_at: string;
    updated_at?: string;
}

// Fonction pour récupérer un utilisateur par ID
export const getUserById = async (userId: string): Promise<User | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
};

// Fonction pour authentifier un utilisateur
export const authenticateUser = async (email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    error?: string;
}> => {
    try {
        // Authentification avec Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return {
                success: false,
                error: 'Email ou mot de passe incorrect'
            };
        }

        if (!data.user || !data.session) {
            return {
                success: false,
                error: 'Authentification échouée'
            };
        }

        // Récupérer les détails de l'utilisateur depuis notre table custom
        const userDetails = await getUserById(data.user.id);

        if (!userDetails) {
            return {
                success: false,
                error: 'Utilisateur non trouvé dans la base de données'
            };
        }

        return {
            success: true,
            token: data.session.access_token,
            user: {
                id: userDetails.id,
                email: userDetails.email,
                institution_id: userDetails.institution_id,
                display_name: userDetails.display_name,
                avatar_url: userDetails.avatar_url,
                created_at: userDetails.created_at
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'Erreur serveur lors de l\'authentification'
        };
    }
};

// Fonction pour créer un utilisateur
export const createUser = async (userData: {
    email: string;
    password: string;
    institution_id: string;
}): Promise<User | null> => {
    try {
        // Utiliser l'API d'authentification Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true, // Confirmer l'email automatiquement
            user_metadata: {
                institution_id: userData.institution_id
            }
        });

        if (authError) {
            // Gérer les erreurs spécifiques
            if (authError.code === 'email_exists') {
                throw new Error('EMAIL_ALREADY_EXISTS');
            }

            return null;
        }

        if (!authData.user) {
            return null;
        }

        // Créer l'utilisateur dans notre table custom users
        const { data: customUser, error: customError } = await supabase
            .from('users')
            .insert([{
                id: authData.user.id, // Utiliser l'ID généré par Supabase
                email: userData.email,
                institution_id: userData.institution_id
            }])
            .select()
            .single();

        if (customError) {
            // TODO: Supprimer l'utilisateur auth si échec custom
            return null;
        }

        return customUser;
    } catch (error) {
        return null;
    }
};

// Fonction pour récupérer une institution par ID
export const getInstitutionById = async (institutionId: string): Promise<Institution | null> => {
    try {
        const { data, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', institutionId)
            .eq('is_active', true)
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
};

// Fonction pour récupérer les posts avec filtrage selon l'institution
export const getPosts = async (userInstitutionId: string, visibility?: 'public' | 'private' | 'all'): Promise<FeedPost[]> => {
    try {
        let query = supabase
            .from('feeds')
            .select('*')
            .eq('institution_id', userInstitutionId);

        // Si une visibilité spécifique est demandée, filtrer par visibilité
        if (visibility && visibility !== 'all') {
            query = query.eq('visibility', visibility);
        } else {
            // Sinon, récupérer tous les posts publics + posts privés de l'institution de l'utilisateur
            query = query.or(`visibility.eq.public,visibility.eq.private`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return [];
        }

        return data || [];
    } catch (error) {
        return [];
    }
};

// Fonction pour créer un post
export const createPost = async (postData: {
    title: string;
    content: string;
    visibility: string;
    author_id: string;
    institution_id: string;
}): Promise<FeedPost | null> => {
    try {
        const { data, error } = await supabase
            .from('feeds')
            .insert([{
                title: postData.title,
                content: postData.content,
                visibility: postData.visibility,
                author_id: postData.author_id,
                institution_id: postData.institution_id
            }])
            .select()
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
};

// Fonction pour mettre à jour un post
export const updatePost = async (postId: string, updates: {
    title?: string;
    content?: string;
    visibility?: 'public' | 'private';
}): Promise<FeedPost | null> => {
    try {
        const { data, error } = await supabase
            .from('feeds')
            .update(updates)
            .eq('id', postId)
            .select()
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
};

// Fonction pour supprimer un post
export const deletePost = async (postId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('feeds')
            .delete()
            .eq('id', postId);

        if (error) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};

// Fonction pour vérifier si un utilisateur peut modifier/supprimer un post
export const canUserModifyPost = async (postId: string, userId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('feeds')
            .select('author_id, institution_id')
            .eq('id', postId)
            .single();

        if (error || !data) {
            return false;
        }

        // L'utilisateur peut modifier le post s'il en est l'auteur
        return data.author_id === userId;
    } catch (error) {
        return false;
    }
};

// Fonction pour mettre à jour un utilisateur
export const updateUser = async (userId: string, updateData: Partial<User>): Promise<User | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        return null;
    }
};

// Fonction pour récupérer les abonnements d'un utilisateur
export const getUserSubscriptions = async (userId: string): Promise<any[] | null> => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('follower_user_id', userId);

        if (error) {
            return null;
        }

        return data || [];
    } catch (error) {
        return null;
    }
};

// Fonction pour créer un abonnement
export const createSubscription = async (userId: string, institutionId: string): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{
                follower_user_id: userId,
                institution_id: institutionId
            }])
            .select()
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
};

// Fonction pour supprimer un abonnement
export const deleteSubscription = async (userId: string, institutionId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('follower_user_id', userId)
            .eq('institution_id', institutionId);

        if (error) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};

// Fonction pour récupérer les détails d'une institution
export const getInstitutionDetails = async (institutionId: string): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', institutionId)
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
};

// Fonction pour récupérer tous les établissements
export const getAllSupabaseInstitutions = async (): Promise<Institution[]> => {
    try {
        const { data, error } = await supabase
            .from('institutions')
            .select('*')
            .order('name');

        if (error) {
            return [];
        }

        return data || [];
    } catch (error) {
        return [];
    }
};

// Fonction pour récupérer un établissement par son ID
export const getSupabaseInstitutionById = async (institutionId: string): Promise<Institution | null> => {
    try {
        const { data, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', institutionId)
            .single();

        if (error) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
};

// Fonction pour récupérer les statistiques d'un utilisateur
export const getUserStats = async (userId: string): Promise<{
    posts_count: number;
    xp_points: number;
    level: number;
    progress_to_next_level: number;
} | null> => {
    try {
        // Compter les posts de l'utilisateur
        const { count: postsCount, error: postsError } = await supabase
            .from('feeds')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', userId);

        if (postsError) {
            console.error('Erreur lors du comptage des posts:', postsError);
            return null;
        }

        const posts_count = postsCount || 0;
        const xp_points = posts_count * 10 + 50;
        const level = Math.floor(xp_points / 100) + 1;
        const progress_to_next_level = (xp_points % 100) / 100;

        return {
            posts_count,
            xp_points,
            level,
            progress_to_next_level
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return null;
    }
};

// Fonction pour récupérer les badges d'un utilisateur
export const getUserBadges = async (userId: string): Promise<Array<{
    badge_id: string;
    badge_name: string;
    badge_description: string;
    badge_icon: string;
    badge_color: string;
    unlocked: boolean;
    unlocked_at?: string;
}>> => {
    try {
        // Récupérer les statistiques de l'utilisateur
        const userStats = await getUserStats(userId);
        
        if (!userStats) {
            return [];
        }

        const badges = [
            {
                badge_id: '1',
                badge_name: 'Premier Post',
                badge_description: 'A publié son premier post',
                badge_icon: 'IconEdit',
                badge_color: 'blue',
                unlocked: userStats.posts_count > 0,
                unlocked_at: userStats.posts_count > 0 ? new Date().toISOString() : undefined
            },
            {
                badge_id: '2',
                badge_name: 'Étudiant Actif',
                badge_description: 'A publié 10 posts',
                badge_icon: 'IconTarget',
                badge_color: 'green',
                unlocked: userStats.posts_count >= 10,
                unlocked_at: userStats.posts_count >= 10 ? new Date().toISOString() : undefined
            },
            {
                badge_id: '3',
                badge_name: 'Expert',
                badge_description: 'A reçu 100 likes',
                badge_icon: 'IconTrophy',
                badge_color: 'gold',
                unlocked: userStats.xp_points >= 1000,
                unlocked_at: userStats.xp_points >= 1000 ? new Date().toISOString() : undefined
            },
            {
                badge_id: '4',
                badge_name: 'Collaborateur',
                badge_description: 'A participé à 5 projets',
                badge_icon: 'IconUsers',
                badge_color: 'purple',
                unlocked: false,
                unlocked_at: undefined
            }
        ];

        return badges;
    } catch (error) {
        console.error('Erreur lors de la récupération des badges:', error);
        return [];
    }
};
