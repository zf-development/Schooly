import { apiService } from './api';

export interface Post {
    id: string;
    title?: string;
    content: string;
    visibility: 'public' | 'private';
    author_id: string;
    created_at: string;
    updated_at: string;
    files?: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url: string;
        path: string;
    }>;
    author?: {
        id: string;
        name: string;
        display_name: string;
        avatar_url: string;
        institution_id: string;
        institution?: {
            id: string;
            name: string;
        };
    };
    likes_count?: number;
    comments_count?: number;
    hasLiked?: boolean; // Nouveau: indique si l'utilisateur actuel a liké ce post
}

export interface CreatePostData {
    title?: string;
    content: string;
    visibility?: 'public' | 'private';
    files?: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url: string;
        path: string;
    }>;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    users?: {
        id: string;
        display_name: string;
        avatar_url: string;
        institution_id: string;
    };
}

export interface LikeResponse {
    liked: boolean;
    likes_count: number;
}

export interface CommentsResponse {
    comments: Comment[];
    total_count: number;
}

export interface PostsResponse {
    posts: Post[];
    total_count: number;
}

class FeedService {
    // Récupérer tous les posts avec statistiques
    async getPosts(limit: number = 20, offset: number = 0): Promise<PostsResponse> {
        try {
            const response = await apiService.getPosts();

            if (response.success && response.data) {
                // Le nouveau contrôleur retourne directement les posts
                const serverData = response.data as any;

                // Transformer la réponse pour correspondre à PostsResponse
                const result = {
                    posts: serverData.posts || [],
                    total_count: serverData.total_posts || 0
                };

                return result;
            } else {
                throw new Error(response.error || 'Erreur lors de la récupération des posts');
            }
        } catch (error) {
            console.error('feedService.getPosts() - Erreur catchée:', error);
            throw error;
        }
    }

    // Créer un nouveau post
    async createPost(data: CreatePostData): Promise<Post> {
        try {
            const response = await apiService.createPost({
                title: data.title || '',
                content: data.content,
                visibility: data.visibility || 'public'
            });
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la création du post');
            }
        } catch (error) {
            console.error('Erreur lors de la création du post:', error);
            throw error;
        }
    }

    // Créer un nouveau post avec fichiers
    async createPostWithFiles(data: CreatePostData, files: File[]): Promise<Post> {
        try {
            const formData = new FormData();

            // Ajouter les données du post
            formData.append('title', data.title || '');
            formData.append('content', data.content);
            formData.append('visibility', data.visibility || 'public');

            // Ajouter les fichiers
            files.forEach((file, index) => {
                formData.append('files', file);
            });

            const response = await apiService.createPostWithFiles(formData);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la création du post avec fichiers');
            }
        } catch (error) {
            console.error('Erreur lors de la création du post avec fichiers:', error);
            throw error;
        }
    }

    // Toggle like pour un post
    async toggleLike(postId: string): Promise<LikeResponse> {
        try {
            const response = await apiService.toggleLike(postId);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors du toggle like');
            }
        } catch (error) {
            console.error('Erreur lors du toggle like:', error);
            throw error;
        }
    }

    // Vérifier si l'utilisateur a liké un post
    async checkLike(postId: string): Promise<{ hasLiked: boolean; likesCount: number }> {
        try {
            const response = await apiService.checkLike(postId);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la vérification du like');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du like:', error);
            throw error;
        }
    }

    // Fonctions pour les commentaires
    async addComment(postId: string, content: string): Promise<Comment> {
        try {
            const response = await apiService.addComment(postId, content);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de l\'ajout du commentaire');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
            throw error;
        }
    }

    async getComments(postId: string, limit: number = 50, offset: number = 0): Promise<CommentsResponse> {
        try {
            const response = await apiService.getComments(postId, limit, offset);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la récupération des commentaires');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
            throw error;
        }
    }

    async updateComment(commentId: string, content: string): Promise<Comment> {
        try {
            const response = await apiService.updateComment(commentId, content);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la modification du commentaire');
            }
        } catch (error) {
            console.error('Erreur lors de la modification du commentaire:', error);
            throw error;
        }
    }

    async deleteComment(commentId: string): Promise<void> {
        try {
            const response = await apiService.deleteComment(commentId);
            if (!response.success) {
                throw new Error(response.error || 'Erreur lors de la suppression du commentaire');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du commentaire:', error);
            throw error;
        }
    }
}

export const feedService = new FeedService();