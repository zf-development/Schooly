// Routes liées aux posts
// - Définir les routes CRUD pour les posts
// - Appliquer les middlewares d'authentification
// - Connecter aux contrôleurs

import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
    getPosts,
    createPost,
    updatePost,
    deletePost,
    createFeedWithFilesController,
    downloadFileController,
    toggleUpvoteController,
    checkUpvoteController,
    addCommentController,
    getCommentsController,
    updateCommentController,
    deleteCommentController
} from '../controllers/feedController';

const router = express.Router();

// Configuration multer pour l'upload de fichiers
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max par fichier
        files: 5 // 5 fichiers max par post
    },
    fileFilter: (req, file, cb) => {
        // Types de fichiers autorisés
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Routes protégées (avec authentification)
router.use(authMiddleware);

// Posts
router.get('/feeds', getPosts);
router.post('/feeds', createPost);
router.put('/feeds/:id', updatePost);
router.delete('/feeds/:id', deletePost);

// Posts avec upload de fichiers
router.post('/feeds/with-files', upload.array('files', 5), createFeedWithFilesController);
router.get('/files/:filePath(*)', downloadFileController);

// Routes pour les upvotes
router.post('/feeds/:postId/upvote', toggleUpvoteController);
router.get('/feeds/:postId/upvote', checkUpvoteController);

// Routes pour les commentaires
router.post('/feeds/:postId/comments', addCommentController);
router.get('/feeds/:postId/comments', getCommentsController);
router.put('/comments/:commentId', updateCommentController);
router.delete('/comments/:commentId', deleteCommentController);

export default router;
