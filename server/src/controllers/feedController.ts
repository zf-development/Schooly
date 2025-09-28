// TODO: Logique pour les endpoints du feed
// - GET /api/feed - Récupérer tous les posts
// - POST /api/feed - Créer un nouveau post
// - PUT /api/feed/:id - Modifier un post
// - DELETE /api/feed/:id - Supprimer un post

import { Request, Response } from 'express';
import { getPosts as getSupabasePosts, createPost as createSupabasePost, updatePost as updateSupabasePost, deletePost as deleteSupabasePost, canUserModifyPost, getUserById, getUserSubscriptions, getInstitutionDetails, supabase, uploadFileToStorage, createFeedWithFiles, togglePostLike, checkUserLike, getPostLikesCount, getPostsWithDetails, addPostComment, getPostComments, updatePostComment, deletePostComment, searchPostsByHashtag, getTrendingHashtags, getAllHashtags } from '../services/supabaseService';
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

        // Récupérer les posts de l'institution de l'utilisateur avec les likes
        const userInstitutionPosts = await getPostsWithDetails(user.institution_id, user.id);

        if (!userInstitutionPosts) {
            return res.status(500).json({
                error: 'Erreur lors de la récupération des posts',
                code: 'DATABASE_ERROR'
            });
        }

        // Récupérer les abonnements de l'utilisateur
        const userSubscriptions = await getUserSubscriptions(user.id);
        let followedInstitutionPosts: any[] = [];

        // Si l'utilisateur suit d'autres établissements, récupérer leurs posts publics
        if (userSubscriptions && userSubscriptions.length > 0) {
            const followedInstitutionIds = userSubscriptions.map(sub => sub.institution_id);

            // Récupérer les posts publics de chaque établissement suivi avec les likes
            for (const institutionId of followedInstitutionIds) {
                try {
                    const publicPosts = await getPostsWithDetails(institutionId, user.id, 'public');
                    if (publicPosts) {
                        followedInstitutionPosts.push(...publicPosts);
                    }
                } catch (error) {
                    console.error(`Erreur lors de la récupération des posts de l'institution ${institutionId}:`, error);
                }
            }
        }

        // Combiner et trier tous les posts par date de création (plus récents en premier)
        // Utiliser un Map pour éviter les doublons basés sur l'ID du post
        const postsMap = new Map();

        // Ajouter d'abord les posts de l'institution de l'utilisateur
        userInstitutionPosts.forEach((post: any) => {
            postsMap.set(post.id, post);
        });

        // Ajouter les posts des établissements suivis (ils remplaceront les doublons)
        followedInstitutionPosts.forEach((post: any) => {
            postsMap.set(post.id, post);
        });

        // Convertir le Map en tableau et trier par date
        const allPosts = Array.from(postsMap.values());
        const sortedPosts = allPosts.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Enrichir chaque post avec les données utilisateur complètes
        const enrichedPosts = await Promise.all(sortedPosts.map(async (post) => {
            try {
                // Récupérer les détails de l'auteur
                const authorDetails = await getUserById(post.author_id);

                // Récupérer les détails de l'institution du post
                const institutionDetails = await getInstitutionDetails(post.institution_id);

                return {
                    ...post,
                    author: {
                        id: post.author_id,
                        name: authorDetails?.display_name || 'Utilisateur',
                        display_name: authorDetails?.display_name || 'Utilisateur',
                        avatar_url: authorDetails?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`,
                        institution: institutionDetails?.name || 'Institution inconnue'
                    }
                };
            } catch (error) {
                // En cas d'erreur, utiliser les valeurs par défaut
                return {
                    ...post,
                    author: {
                        id: post.author_id,
                        name: 'Utilisateur',
                        display_name: 'Utilisateur',
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`,
                        institution: 'Institution inconnue'
                    }
                };
            }
        }));

        res.status(200).json({
            posts: enrichedPosts,
            user_institution: user.institution_id,
            total_posts: enrichedPosts.length,
            posts_from_user_institution: userInstitutionPosts.length,
            posts_from_followed_institutions: followedInstitutionPosts.length,
            followed_institutions_count: userSubscriptions ? userSubscriptions.length : 0,
            message: 'Posts récupérés avec filtrage selon l\'institution et les abonnements'
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

// Créer un nouveau post avec upload de fichiers
export const createFeedWithFilesController = async (req: Request, res: Response) => {
    try {
        const { title, content, visibility } = req.body;
        const files = (req as any).files as Array<{
            originalname: string;
            mimetype: string;
            size: number;
            buffer: Buffer;
        }>;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        if (!content) {
            return res.status(400).json({
                error: 'Le contenu est requis',
                code: 'MISSING_CONTENT'
            });
        }

        // Upload des fichiers vers Supabase Storage
        const uploadedFiles = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const uploadResult = await uploadFileToStorage(
                    file.buffer,
                    file.originalname,
                    file.mimetype,
                    userId
                );

                if (uploadResult) {
                    uploadedFiles.push({
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        url: uploadResult.url,
                        path: uploadResult.path
                    });
                }
            }
        }

        // Récupérer l'institution_id de l'utilisateur
        const userDetails = await getUserById(userId);
        const institution_id = userDetails?.institution_id;

        if (!institution_id) {
            return res.status(400).json({
                error: 'Institution non trouvée pour l\'utilisateur',
                code: 'MISSING_INSTITUTION'
            });
        }

        // Créer le post avec les fichiers
        const feed = await createFeedWithFiles({
            title,
            content,
            visibility: visibility || 'public',
            author_id: userId,
            institution_id: institution_id,
            files: uploadedFiles
        });

        if (!feed) {
            await AuditService.logError(
                'feeds',
                'Erreur lors de la création du post avec fichiers',
                userId,
                (req as any).user?.email,
                (req as any).user?.institution_id,
                extractRequestContext(req),
                'création de post avec fichiers'
            );
            return res.status(500).json({
                error: 'Erreur lors de la création du post avec fichiers',
                code: 'DATABASE_ERROR'
            });
        }

        if (feed) {
            await AuditService.logCreate(
                'feeds',
                feed.id,
                feed,
                userId,
                (req as any).user?.email,
                (req as any).user?.institution_id,
                extractRequestContext(req),
                `Post créé avec fichiers: "${title}"`
            );
        }

        res.status(201).json({
            message: 'Post créé avec succès avec fichiers',
            post: feed
        });
    } catch (error) {
        console.error('Erreur lors de la création du post avec fichiers:', error);
        await AuditService.logError(
            'feeds',
            'Erreur lors de la création du post avec fichiers',
            (req as any).user?.id,
            (req as any).user?.email,
            (req as any).user?.institution_id,
            extractRequestContext(req),
            'création de post avec fichiers'
        );
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

// Télécharger un fichier
export const downloadFileController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { filePath } = req.params;

        if (!filePath) {
            return res.status(400).json({
                error: 'Chemin du fichier requis',
                code: 'MISSING_FILE_PATH'
            });
        }



        // Vérifier d'abord si le bucket existe
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            console.error("Erreur lors de la récupération des buckets:", bucketsError);
            return res.status(500).json({
                error: 'Erreur de configuration du stockage',
                code: 'STORAGE_CONFIG_ERROR'
            });
        }

        // Vérifier si le bucket post-files existe
        const postFilesBucket = buckets?.find(b => b.name === 'post-files');
        if (!postFilesBucket) {
            console.error("Bucket 'post-files' non trouvé");
            return res.status(404).json({
                error: 'Bucket de stockage non trouvé',
                code: 'STORAGE_BUCKET_NOT_FOUND'
            });
        }



        // Lister les fichiers dans le bucket pour debug
        const { data: files, error: listError } = await supabase.storage
            .from('post-files')
            .list();

        if (listError) {
            console.error("Erreur lors de la liste des fichiers:", listError);
        }

        const { data, error } = await supabase.storage
            .from('post-files')
            .download(filePath);

        if (error) {
            console.error("Erreur lors du téléchargement:", error);
            return res.status(404).json({
                error: 'Fichier non trouvé',
                code: 'FILE_NOT_FOUND'
            });
        }

        // Déterminer le type MIME basé sur l'extension
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        if (fileExtension === 'pdf') contentType = 'application/pdf';
        else if (fileExtension === 'png') contentType = 'image/png';
        else if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
        else if (fileExtension === 'gif') contentType = 'image/gif';
        else if (fileExtension === 'txt') contentType = 'text/plain';
        else if (fileExtension === 'doc') contentType = 'application/msword';
        else if (fileExtension === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filePath.split('/').pop()}"`);
        res.send(data);

    } catch (error) {
        console.error("Erreur dans downloadFileController:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            code: 'SERVER_ERROR'
        });
    }
};

// Contrôleur pour toggle like
export const toggleLikeController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({
                error: 'ID du post requis',
                code: 'MISSING_POST_ID'
            });
        }

        const result = await togglePostLike(postId, user.id);
        if (!result) {
            return res.status(500).json({
                error: 'Erreur lors du toggle like',
                code: 'LIKE_ERROR'
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Upvote mis à jour avec succès'
        });

    } catch (error) {
        console.error("Erreur dans toggleUpvoteController:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            code: 'SERVER_ERROR'
        });
    }
};

// Contrôleur pour vérifier si l'utilisateur a liké
export const checkLikeController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({
                error: 'ID du post requis',
                code: 'MISSING_POST_ID'
            });
        }

        const hasLiked = await checkUserLike(postId, user.id);
        const likesCount = await getPostLikesCount(postId);

        return res.status(200).json({
            success: true,
            data: {
                hasLiked,
                likesCount
            }
        });

    } catch (error) {
        console.error("Erreur dans checkLikeController:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            code: 'SERVER_ERROR'
        });
    }
};

// Contrôleurs pour les commentaires

// Ajouter un commentaire
export const addCommentController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { postId } = req.params;
        const { content } = req.body;

        if (!postId || !content || !content.trim()) {
            return res.status(400).json({
                error: 'ID du post et contenu du commentaire requis',
                code: 'MISSING_DATA'
            });
        }

        const result = await addPostComment(postId, user.id, content);
        if (!result) {
            return res.status(500).json({
                error: 'Erreur lors de l\'ajout du commentaire',
                code: 'COMMENT_ERROR'
            });
        }

        return res.status(201).json({
            success: true,
            data: result,
            message: 'Commentaire ajouté avec succès'
        });

    } catch (error) {
        console.error("Erreur dans addCommentController:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            code: 'SERVER_ERROR'
        });
    }
};

// Récupérer les commentaires d'un post
export const getCommentsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { postId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        if (!postId) {
            return res.status(400).json({
                error: 'ID du post requis',
                code: 'MISSING_POST_ID'
            });
        }

        const result = await getPostComments(
            postId,
            parseInt(limit as string),
            parseInt(offset as string)
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Erreur dans getCommentsController:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            code: 'SERVER_ERROR'
        });
    }
};

// Modifier un commentaire
export const updateCommentController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { commentId } = req.params;
        const { content } = req.body;

        if (!commentId || !content || !content.trim()) {
            return res.status(400).json({
                error: 'ID du commentaire et contenu requis',
                code: 'MISSING_DATA'
            });
        }

        const result = await updatePostComment(commentId, user.id, content);
        if (!result) {
            return res.status(500).json({
                error: 'Erreur lors de la modification du commentaire',
                code: 'COMMENT_ERROR'
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
            message: 'Commentaire modifié avec succès'
        });

    } catch (error) {
        console.error("Erreur dans updateCommentController:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            code: 'SERVER_ERROR'
        });
    }
};

// Supprimer un commentaire
export const deleteCommentController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { commentId } = req.params;

        if (!commentId) {
            return res.status(400).json({
                error: 'ID du commentaire requis',
                code: 'MISSING_COMMENT_ID'
            });
        }

        const success = await deletePostComment(commentId, user.id);
        if (!success) {
            return res.status(500).json({
                error: 'Erreur lors de la suppression du commentaire',
                code: 'COMMENT_ERROR'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Commentaire supprimé avec succès'
        });

    } catch (error) {
        console.error("Erreur dans deleteCommentController:", error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            code: 'SERVER_ERROR'
        });
    }
};

// Rechercher des posts par hashtag
export const searchByHashtag = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { hashtag } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        if (!hashtag) {
            return res.status(400).json({
                error: 'Hashtag requis',
                code: 'MISSING_HASHTAG'
            });
        }

        // Récupérer l'institution de l'utilisateur
        const userDetails = await getUserById(userId);
        const institutionId = userDetails?.institution_id;

        if (!institutionId) {
            return res.status(400).json({
                error: 'Institution non trouvée pour l\'utilisateur',
                code: 'MISSING_INSTITUTION'
            });
        }

        const posts = await searchPostsByHashtag(
            hashtag,
            institutionId,
            parseInt(limit as string),
            parseInt(offset as string)
        );

        // Transformer les posts pour correspondre au format attendu
        const transformedPosts = posts.map(post => {
            const transformedFiles = (() => {
                if (!post.files) return [];
                if (typeof post.files === "string") {
                    try {
                        return JSON.parse(post.files);
                    } catch (e) {
                        console.error("Erreur parsing fichiers:", e);
                        return [];
                    }
                }
                return post.files;
            })();

            return {
                id: post.id,
                title: post.title,
                content: post.content,
                visibility: post.visibility,
                author: {
                    id: post.users.id,
                    name: post.users.display_name,
                    display_name: post.users.display_name,
                    avatar_url: post.users.avatar_url,
                    institution_id: post.users.institution_id,
                    institution: post.institutions.name
                },
                created_at: post.created_at,
                files: transformedFiles,
                hashtags: post.hashtags || [],
                likes_count: post.likes_count || 0,
                comments_count: post.comments_count || 0,
                hasLiked: post.hasLiked || false
            };
        });

        res.json({
            posts: transformedPosts,
            total_count: transformedPosts.length
        });

    } catch (error) {
        console.error('Erreur lors de la recherche par hashtag:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

// Obtenir les hashtags tendances
export const getTrendingHashtagsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        const { limit = 10 } = req.query;

        // Récupérer l'institution de l'utilisateur
        const userDetails = await getUserById(userId);
        const institutionId = userDetails?.institution_id;

        if (!institutionId) {
            return res.status(400).json({
                error: 'Institution non trouvée pour l\'utilisateur',
                code: 'MISSING_INSTITUTION'
            });
        }

        const trendingHashtags = await getTrendingHashtags(
            institutionId,
            parseInt(limit as string)
        );

        res.json({
            hashtags: trendingHashtags
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des hashtags tendances:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

// Obtenir tous les hashtags disponibles
export const getAllHashtagsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Utilisateur non authentifié',
                code: 'UNAUTHORIZED'
            });
        }

        // Récupérer l'institution de l'utilisateur
        const userDetails = await getUserById(userId);
        const institutionId = userDetails?.institution_id;

        if (!institutionId) {
            return res.status(400).json({
                error: 'Institution non trouvée pour l\'utilisateur',
                code: 'MISSING_INSTITUTION'
            });
        }

        const hashtags = await getAllHashtags(institutionId);

        res.json({
            hashtags: hashtags
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des hashtags:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};
