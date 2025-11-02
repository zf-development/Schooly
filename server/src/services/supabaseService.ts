import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extractAndValidateHashtags } from '../utils/hashtagUtils';
import { SupabaseUser as User, SupabaseInstitution as Institution, SupabaseFeedPost as FeedPost, SupabaseUserBadge as UserBadge, SupabaseCalendarEvent as CalendarEvent } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);


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

export const createPost = async (postData: {
    title: string;
    content: string;
    visibility: string;
    author_id: string;
    institution_id: string;
}): Promise<FeedPost | null> => {
    try {
        // Extraire les hashtags du contenu
        const hashtags = extractAndValidateHashtags(postData.content);

        const { data, error } = await supabase
            .from('feeds')
            .insert([{
                title: postData.title,
                content: postData.content,
                visibility: postData.visibility,
                author_id: postData.author_id,
                institution_id: postData.institution_id,
                hashtags: hashtags
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

export const getSupabaseInstitutionById = async (institutionId: string): Promise<Institution | null> => {
    try {
        const { data, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', institutionId)
            .single();

        if (error) {
            console.error(`Erreur lors de la récupération de l'institution ${institutionId}:`, error);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Exception lors de la récupération de l'institution ${institutionId}:`, error);
        return null;
    }
};

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

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
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

export const getPostsWithDetails = async (userInstitutionId: string, userId?: string, visibility?: 'public' | 'private' | 'all'): Promise<any[]> => {
    try {
        // Récupérer directement depuis la table feeds pour avoir accès aux fichiers
        let query = supabase
            .from('feeds')
            .select(`
                *,
                users!inner (
                    id,
                    display_name,
                    avatar_url,
                    institution_id
                ),
                institutions!inner (
                    id,
                    name
                )
            `)
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
            console.error('Erreur lors de la récupération des posts avec détails:', error);
            return [];
        }

        if (data && data.length > 0) {
            const postIds = data.map(post => post.id);

            // Récupérer les statistiques de likes pour tous les posts
            const { data: likesStats, error: likesError } = await supabase
                .from('post_upvotes')
                .select('post_id')
                .in('post_id', postIds);

            // Récupérer les statistiques de commentaires pour tous les posts
            const { data: commentsStats, error: commentsError } = await supabase
                .from('post_comments')
                .select('post_id')
                .in('post_id', postIds);

            // Récupérer les likes de l'utilisateur si userId est fourni
            let userLikes: any[] = [];
            if (userId) {
                const { data: userLikesData, error: userLikesError } = await supabase
                    .from('post_upvotes')
                    .select('post_id')
                    .eq('user_id', userId)
                    .in('post_id', postIds);

                if (!userLikesError && userLikesData) {
                    userLikes = userLikesData;
                }
            }

            // Compter les likes et commentaires par post
            const likesCount = new Map();
            const commentsCount = new Map();
            const userLikedPosts = new Set(userLikes.map(like => like.post_id));

            if (!likesError && likesStats) {
                likesStats.forEach(like => {
                    likesCount.set(like.post_id, (likesCount.get(like.post_id) || 0) + 1);
                });
            }

            if (!commentsError && commentsStats) {
                commentsStats.forEach(comment => {
                    commentsCount.set(comment.post_id, (commentsCount.get(comment.post_id) || 0) + 1);
                });
            }

            // Ajouter les statistiques à chaque post
            data.forEach(post => {
                post.likes_count = likesCount.get(post.id) || 0;
                post.comments_count = commentsCount.get(post.id) || 0;
                post.hasLiked = userLikedPosts.has(post.id);
            });
        }

        return data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des posts avec détails:', error);
        return [];
    }
};

export const uploadFileToStorage = async (
    file: Buffer,
    fileName: string,
    contentType: string,
    userId: string
): Promise<{ url: string; path: string } | null> => {
    try {
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

        const { data, error } = await supabase.storage
            .from('post-files')
            .upload(uniqueFileName, file, {
                contentType: contentType,
                upsert: false
            });

        if (error) {
            console.error('Erreur lors de l\'upload du fichier:', error);
            return null;
        }

        // Générer une URL publique pour le fichier
        const { data: urlData } = supabase.storage
            .from('post-files')
            .getPublicUrl(uniqueFileName);

        return {
            url: urlData.publicUrl,
            path: uniqueFileName
        };
    } catch (error) {
        console.error('Erreur lors de l\'upload du fichier:', error);
        return null;
    }
};

export const deleteFileFromStorage = async (filePath: string): Promise<boolean> => {
    try {
        const { error } = await supabase.storage
            .from('post-files')
            .remove([filePath]);

        if (error) {
            console.error('Erreur lors de la suppression du fichier:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        return false;
    }
};

export const createFeedWithFiles = async (feedData: {
    title?: string;
    content: string;
    visibility: string;
    author_id: string;
    institution_id: string;
    files: Array<{
        name: string;
        type: string;
        size: number;
        url: string;
        path: string;
    }>;
}): Promise<FeedPost | null> => {
    try {
        // Extraire les hashtags du contenu
        const hashtags = extractAndValidateHashtags(feedData.content);

        const { data, error } = await supabase
            .from('feeds')
            .insert({
                title: feedData.title,
                content: feedData.content,
                visibility: feedData.visibility,
                author_id: feedData.author_id,
                institution_id: feedData.institution_id,
                files: feedData.files,
                hashtags: hashtags,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Erreur lors de la création du feed avec fichiers:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la création du feed avec fichiers:', error);
        return null;
    }
};

export const togglePostLike = async (postId: string, userId: string): Promise<{ liked: boolean; likes_count: number } | null> => {
    try {
        // Vérifier si l'utilisateur a déjà liké ce post
        const { data: existingLike, error: checkError } = await supabase
            .from('post_upvotes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Erreur lors de la vérification du like:', checkError);
            return null;
        }

        if (existingLike) {
            // Supprimer le like existant
            const { error: deleteError } = await supabase
                .from('post_upvotes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);

            if (deleteError) {
                console.error('Erreur lors de la suppression du like:', deleteError);
                return null;
            }
        } else {
            // Ajouter un nouveau like
            const { error: insertError } = await supabase
                .from('post_upvotes')
                .insert({
                    post_id: postId,
                    user_id: userId,
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Erreur lors de l\'ajout du like:', insertError);
                return null;
            }
        }

        // Récupérer le nouveau nombre de likes
        const { count, error: countError } = await supabase
            .from('post_upvotes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (countError) {
            console.error('Erreur lors du comptage des likes:', countError);
            return null;
        }

        return {
            liked: !existingLike,
            likes_count: count || 0
        };
    } catch (error) {
        console.error('Erreur lors du toggle like:', error);
        return null;
    }
};

export const checkUserLike = async (postId: string, userId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('post_upvotes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Erreur lors de la vérification du like:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Erreur lors de la vérification du like:', error);
        return false;
    }
};

export const getPostLikesCount = async (postId: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('post_upvotes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (error) {
            console.error('Erreur lors du comptage des likes:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Erreur lors du comptage des likes:', error);
        return 0;
    }
};

export const addPostComment = async (postId: string, userId: string, content: string): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('post_comments')
            .insert({
                post_id: postId,
                user_id: userId,
                content: content.trim()
            })
            .select(`
                *,
                users!inner (
                    id,
                    display_name,
                    avatar_url,
                    institution_id
                )
            `)
            .single();

        if (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        return null;
    }
};

export const getPostComments = async (postId: string, limit: number = 50, offset: number = 0): Promise<{ comments: any[]; total_count: number }> => {
    try {
        // Récupérer les commentaires avec les informations utilisateur
        const { data, error } = await supabase
            .from('post_comments')
            .select(`
                *,
                users!inner (
                    id,
                    display_name,
                    avatar_url,
                    institution_id
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
            return { comments: [], total_count: 0 };
        }

        // Récupérer le nombre total de commentaires
        const { count, error: countError } = await supabase
            .from('post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (countError) {
            console.error('Erreur lors du comptage des commentaires:', countError);
        }

        return {
            comments: data || [],
            total_count: count || 0
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return { comments: [], total_count: 0 };
    }
};

export const updatePostComment = async (commentId: string, userId: string, content: string): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('post_comments')
            .update({
                content: content.trim()
            })
            .eq('id', commentId)
            .eq('user_id', userId) // S'assurer que seul l'auteur peut modifier
            .select(`
                *,
                users!inner (
                    id,
                    display_name,
                    avatar_url,
                    institution_id
                )
            `)
            .single();

        if (error) {
            console.error('Erreur lors de la modification du commentaire:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la modification du commentaire:', error);
        return null;
    }
};

export const deletePostComment = async (commentId: string, userId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('post_comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', userId); // S'assurer que seul l'auteur peut supprimer

        if (error) {
            console.error('Erreur lors de la suppression du commentaire:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        return false;
    }
};

export const searchPostsByHashtag = async (hashtag: string, institutionId: string, limit: number = 20, offset: number = 0): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('feeds')
            .select(`
                *,
                users!inner (
                    id,
                    display_name,
                    avatar_url,
                    institution_id
                ),
                institutions!inner (
                    id,
                    name
                )
            `)
            .eq('institution_id', institutionId)
            .contains('hashtags', [hashtag.toLowerCase()])
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Erreur lors de la recherche par hashtag:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Erreur lors de la recherche par hashtag:', error);
        return [];
    }
};

export const getTrendingHashtags = async (institutionId: string, limit: number = 10): Promise<Array<{ hashtag: string; count: number }>> => {
    try {
        // Récupérer tous les posts de l'institution avec leurs hashtags
        const { data, error } = await supabase
            .from('feeds')
            .select('hashtags')
            .eq('institution_id', institutionId)
            .not('hashtags', 'is', null);

        if (error) {
            console.error('Erreur lors de la récupération des hashtags:', error);
            return [];
        }

        // Compter les occurrences de chaque hashtag
        const hashtagCounts: { [key: string]: number } = {};

        data?.forEach(post => {
            if (post.hashtags && Array.isArray(post.hashtags)) {
                post.hashtags.forEach(hashtag => {
                    const normalizedHashtag = hashtag.toLowerCase();
                    hashtagCounts[normalizedHashtag] = (hashtagCounts[normalizedHashtag] || 0) + 1;
                });
            }
        });

        // Trier par nombre d'occurrences et retourner les plus populaires
        return Object.entries(hashtagCounts)
            .map(([hashtag, count]) => ({ hashtag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    } catch (error) {
        console.error('Erreur lors de la récupération des hashtags tendances:', error);
        return [];
    }
};

export const getAllHashtags = async (institutionId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('feeds')
            .select('hashtags')
            .eq('institution_id', institutionId)
            .not('hashtags', 'is', null);

        if (error) {
            console.error('Erreur lors de la récupération des hashtags:', error);
            return [];
        }

        const allHashtags = new Set<string>();

        data?.forEach(post => {
            if (post.hashtags && Array.isArray(post.hashtags)) {
                post.hashtags.forEach(hashtag => {
                    allHashtags.add(hashtag.toLowerCase());
                });
            }
        });

        return Array.from(allHashtags).sort();
    } catch (error) {
        console.error('Erreur lors de la récupération des hashtags:', error);
        return [];
    }
};

export const getUserCalendarEvents = async (userId: string): Promise<CalendarEvent[]> => {
    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Erreur lors de la récupération des événements du calendrier:', error);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des événements du calendrier:', error);
        return [];
    }
}

export const getUserCalendarEventById = async (eventId: string): Promise<CalendarEvent | null> => {
    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (error) {
            console.error('Erreur lors de la récupération de l\'événement du calendrier:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'événement du calendrier:', error);
        return null;
    }
}

export const createUserCalendarEvent = async (eventData: any): Promise<CalendarEvent | null> => {
    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .insert(eventData)
            .select()
            .single();

        if (error) {
            console.error('Erreur lors de la création de l\'événement du calendrier:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement du calendrier:', error);
        return null;
    }
};

export const updateUserCalendarEvent = async (eventId: string, eventData: any): Promise<CalendarEvent | null> => {
    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .update({
                ...eventData,
                updated_at: new Date().toISOString()
            })
            .eq('id', eventId)
            .select()
            .single();

        if (error) {
            console.error('Erreur lors de la mise à jour de l\'événement du calendrier:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement du calendrier:', error);
        return null;
    }
};

export const deleteUserCalendarEvent = async (eventId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', eventId);

        if (error) {
            console.error('Erreur lors de la suppression de l\'événement du calendrier:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement du calendrier:', error);
        return false;
    }
};

export const createUserPage = async (pageData: any): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('pages')
            .insert(pageData)
            .select()
            .single();

        if (error) {
            console.error('Erreur lors de la création de la page:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Erreur lors de la création de la page:', error);
        return null;
    }
};

export const getUserPages = async (userId: string): Promise<any[] | null> => {
    try {
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Erreur lors de la récupération des pages:', error);
            return null;
        }
        return data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des pages:', error);
        return null;
    }
};

export const getUserPageById = async (userId: string, pageId: string): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('id', pageId)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Erreur lors de la récupération de la page:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération de la page:', error);
        return null;
    }
};

export const updateUserPage = async (pageId: string, pageData: any): Promise<any | null> => {
    try {
        const { data, error } = await supabase
            .from('pages')
            .update({
                ...pageData,
                updated_at: new Date().toISOString()
            })
            .eq('id', pageId)
            .select()
            .single();

        if (error) {
            console.error('Erreur lors de la mise à jour de la page:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la page:', error);
        return null;
    }
};

export const deleteUserPage = async (pageId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('pages')
            .delete()
            .eq('id', pageId);

        if (error) {
            console.error('Erreur lors de la suppression de la page:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la page:', error);
        return false;
    }
};

export { supabase };
