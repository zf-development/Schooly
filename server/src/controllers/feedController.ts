// TODO: Logique pour les endpoints du feed
// - GET /api/feed - Récupérer tous les posts
// - POST /api/feed - Créer un nouveau post
// - PUT /api/feed/:id - Modifier un post
// - DELETE /api/feed/:id - Supprimer un post

import { Request, Response } from 'express';
import { getPosts as getSupabasePosts, createPost as createSupabasePost, updatePost as updateSupabasePost, deletePost as deleteSupabasePost, canUserModifyPost } from '../services/supabaseService';
import { AuditService, extractRequestContext } from '../services/auditService';

// Interface étendue pour inclure l'utilisateur authentifié
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        institution_id: string;
        name: string;
        email: string;
    };
}

// TODO: Récupérer tous les posts
export const getPosts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Récupérer l'utilisateur connecté depuis le middleware d'authentification
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        // Récupérer les posts depuis Supabase avec filtrage selon l'institution
        const posts = await getSupabasePosts(user.institution_id);

        if (!posts) {
            return res.status(500).json({
                error: 'Erreur lors de la récupération des posts',
                code: 'DATABASE_ERROR'
            });
        }

        res.status(200).json({
            posts: posts,
            user_institution: user.institution_id,
            total_posts: posts.length,
            message: 'Posts récupérés depuis Supabase avec filtrage selon l\'institution'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur serveur lors de la récupération des posts',
            code: 'SERVER_ERROR'
        });
    }
};

// TODO: Créer un nouveau post
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, content, visibility = 'public' } = req.body;

        // Validation des inputs
        if (!title || !content) {
            return res.status(400).json({
                error: 'Titre et contenu requis',
                code: 'MISSING_POST_FIELDS'
            });
        }

        // Validation titre
        if (title.trim().length < 3) {
            return res.status(400).json({
                error: 'Le titre doit contenir au moins 3 caractères',
                code: 'TITLE_TOO_SHORT'
            });
        }

        if (title.trim().length > 100) {
            return res.status(400).json({
                error: 'Le titre ne peut pas dépasser 100 caractères',
                code: 'TITLE_TOO_LONG'
            });
        }

        // Validation contenu
        if (content.trim().length < 10) {
            return res.status(400).json({
                error: 'Le contenu doit contenir au moins 10 caractères',
                code: 'CONTENT_TOO_SHORT'
            });
        }

        if (content.trim().length > 2000) {
            return res.status(400).json({
                error: 'Le contenu ne peut pas dépasser 2000 caractères',
                code: 'CONTENT_TOO_LONG'
            });
        }

        // Validation visibility
        if (visibility !== 'public' && visibility !== 'private') {
            return res.status(400).json({
                error: 'La visibilité doit être "public" ou "private"',
                code: 'INVALID_VISIBILITY'
            });
        }

        // Créer le post dans Supabase
        const newPost = await createSupabasePost({
            title,
            content,
            visibility,
            author_id: req.user?.id || '',
            institution_id: req.user?.institution_id || ''
        });

        if (!newPost) {
            // Logger l'erreur
            await AuditService.logError(
                'feeds',
                'Erreur lors de la création du post',
                req.user?.id,
                req.user?.email,
                req.user?.institution_id,
                extractRequestContext(req),
                'création de post'
            );

            return res.status(500).json({
                error: 'Erreur lors de la création du post',
                code: 'DATABASE_ERROR'
            });
        }

        // Logger la création réussie
        await AuditService.logCreate(
            'feeds',
            newPost.id,
            newPost,
            req.user?.id,
            req.user?.email,
            req.user?.institution_id,
            extractRequestContext(req),
            `Post créé: "${title}"`
        );

        res.status(201).json({
            message: 'Post créé avec succès',
            post: newPost
        });
    } catch (error) {
        // TODO: Gérer les erreurs
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// TODO: Modifier un post
export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, visibility } = req.body;

        // Validation de l'ID
        if (!id || id.trim().length === 0) {
            return res.status(400).json({
                error: 'ID du post requis',
                code: 'MISSING_POST_ID'
            });
        }

        // Validation des champs optionnels (au moins un doit être présent)
        if (!title && !content && !visibility) {
            return res.status(400).json({
                error: 'Au moins un champ (titre, contenu ou visibilité) doit être fourni',
                code: 'NO_FIELDS_TO_UPDATE'
            });
        }

        // Validation titre si fourni
        if (title !== undefined) {
            if (title.trim().length < 3) {
                return res.status(400).json({
                    error: 'Le titre doit contenir au moins 3 caractères',
                    code: 'TITLE_TOO_SHORT'
                });
            }

            if (title.trim().length > 100) {
                return res.status(400).json({
                    error: 'Le titre ne peut pas dépasser 100 caractères',
                    code: 'TITLE_TOO_LONG'
                });
            }
        }

        // Validation contenu si fourni
        if (content !== undefined) {
            if (content.trim().length < 10) {
                return res.status(400).json({
                    error: 'Le contenu doit contenir au moins 10 caractères',
                    code: 'CONTENT_TOO_SHORT'
                });
            }

            if (content.trim().length > 2000) {
                return res.status(400).json({
                    error: 'Le contenu ne peut pas dépasser 2000 caractères',
                    code: 'CONTENT_TOO_LONG'
                });
            }
        }

        // Validation visibility si fournie
        if (visibility !== undefined && !['public', 'private'].includes(visibility)) {
            return res.status(400).json({
                error: 'La visibilité doit être "public" ou "private"',
                code: 'INVALID_VISIBILITY'
            });
        }

        // Vérifier que l'utilisateur peut modifier ce post
        if (!req.user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const canModify = await canUserModifyPost(id, req.user.id);
        if (!canModify) {
            // Logger l'accès refusé
            await AuditService.logAccessDenied(
                'feeds',
                req.user.id,
                req.user.email,
                req.user.institution_id,
                extractRequestContext(req),
                `Tentative de modification non autorisée du post ${id}`
            );

            return res.status(403).json({
                error: 'Vous n\'êtes pas autorisé à modifier ce post',
                code: 'FORBIDDEN'
            });
        }

        // Récupérer l'ancien post pour l'audit
        const oldPost = await getSupabasePosts(req.user.institution_id);
        const oldPostData = oldPost.find(post => post.id === id);

        // Mettre à jour le post dans Supabase
        const updatedPost = await updateSupabasePost(id, { title, content, visibility });

        if (!updatedPost) {
            // Logger l'erreur
            await AuditService.logError(
                'feeds',
                'Erreur lors de la modification du post',
                req.user.id,
                req.user.email,
                req.user.institution_id,
                extractRequestContext(req),
                'modification de post'
            );

            return res.status(500).json({
                error: 'Erreur lors de la modification du post',
                code: 'DATABASE_ERROR'
            });
        }

        // Logger la modification réussie
        await AuditService.logUpdate(
            'feeds',
            id,
            oldPostData || {},
            updatedPost,
            req.user.id,
            req.user.email,
            req.user.institution_id,
            extractRequestContext(req),
            `Post modifié: "${title || 'titre non modifié'}"`
        );

        res.status(200).json({
            message: 'Post modifié avec succès',
            post: updatedPost
        });
    } catch (error) {
        // TODO: Gérer les erreurs
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// TODO: Supprimer un post
export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Validation de l'ID
        if (!id || id.trim().length === 0) {
            return res.status(400).json({
                error: 'ID du post requis',
                code: 'MISSING_POST_ID'
            });
        }

        // Vérifier que l'utilisateur peut supprimer ce post
        if (!req.user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const canModify = await canUserModifyPost(id, req.user.id);
        if (!canModify) {
            // Logger l'accès refusé
            await AuditService.logAccessDenied(
                'feeds',
                req.user.id,
                req.user.email,
                req.user.institution_id,
                extractRequestContext(req),
                `Tentative de suppression non autorisée du post ${id}`
            );

            return res.status(403).json({
                error: 'Vous n\'êtes pas autorisé à supprimer ce post',
                code: 'FORBIDDEN'
            });
        }

        // Récupérer l'ancien post pour l'audit
        const oldPost = await getSupabasePosts(req.user.institution_id);
        const oldPostData = oldPost.find(post => post.id === id);

        // Supprimer le post dans Supabase
        const success = await deleteSupabasePost(id);

        if (!success) {
            // Logger l'erreur
            await AuditService.logError(
                'feeds',
                'Erreur lors de la suppression du post',
                req.user.id,
                req.user.email,
                req.user.institution_id,
                extractRequestContext(req),
                'suppression de post'
            );

            return res.status(500).json({
                error: 'Erreur lors de la suppression du post',
                code: 'DATABASE_ERROR'
            });
        }

        // Logger la suppression réussie
        await AuditService.logDelete(
            'feeds',
            id,
            oldPostData || {},
            req.user.id,
            req.user.email,
            req.user.institution_id,
            extractRequestContext(req),
            `Post supprimé: "${oldPostData?.title || 'titre inconnu'}"`
        );

        res.status(200).json({
            message: 'Post supprimé avec succès'
        });
    } catch (error) {
        // TODO: Gérer les erreurs
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
