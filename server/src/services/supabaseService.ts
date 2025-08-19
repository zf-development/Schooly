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
            console.error('Erreur Supabase getUserById:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur getUserById:', error);
        return null;
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
            console.error('Erreur Supabase auth createUser:', authError);

            // Gérer les erreurs spécifiques
            if (authError.code === 'email_exists') {
                throw new Error('EMAIL_ALREADY_EXISTS');
            }

            return null;
        }

        if (!authData.user) {
            console.error('Aucun utilisateur créé dans auth.users');
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
            console.error('Erreur création utilisateur custom:', customError);
            // TODO: Supprimer l'utilisateur auth si échec custom
            return null;
        }

        return customUser;
    } catch (error) {
        console.error('Erreur createUser:', error);
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
            console.error('Erreur Supabase getInstitutionById:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur getInstitutionById:', error);
        return null;
    }
};

// Fonction pour récupérer les posts avec filtrage selon l'institution
export const getPosts = async (userInstitutionId: string): Promise<FeedPost[]> => {
    try {
        // Récupérer tous les posts publics + posts privés de l'institution de l'utilisateur
        const { data, error } = await supabase
            .from('feeds')
            .select('*')
            .or(`visibility.eq.public,and(institution_id.eq.${userInstitutionId},visibility.eq.private)`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erreur Supabase getPosts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erreur getPosts:', error);
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
            console.error('Erreur Supabase createPost:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur createPost:', error);
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
            console.error('Erreur Supabase updatePost:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur updatePost:', error);
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
            console.error('Erreur Supabase deletePost:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur deletePost:', error);
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
        console.error('Erreur canUserModifyPost:', error);
        return false;
    }
};
