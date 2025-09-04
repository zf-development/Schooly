import React, { useState, useEffect } from "react";
import {
    Stack,
    Text,
    Group,
    Avatar,
    Textarea,
    Button,
    Divider,
    Box,
    ActionIcon,
    Menu,
    Modal,
    Tooltip,
} from "@mantine/core";
import {
    IconMessageCircle,
    IconSend,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconFlag,
    IconSortAscending,
    IconSortDescending,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { feedService } from "../services/feedService";
import ReportPostModal from "./ReportPostModal";

// Fonction utilitaire pour formater les dates de manière sécurisée
const formatCommentDate = (dateString: string | undefined): string => {
    if (!dateString) return "Date inconnue";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Date invalide";
        }

        return formatDistanceToNow(date, {
            addSuffix: true,
            locale: fr,
        });
    } catch (error) {
        console.error("Erreur lors du formatage de la date:", error);
        return "Date invalide";
    }
};

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

interface CommentSectionProps {
    postId: string;
    commentsCount: number;
    onCommentsCountChange?: (count: number) => void;
    showComments: boolean;
    onToggleComments: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    postId,
    commentsCount,
    onCommentsCountChange,
    showComments,
    onToggleComments,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [reportModalOpened, setReportModalOpened] = useState(false);
    const [commentToReport, setCommentToReport] = useState<Comment | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Charger les commentaires
    const loadComments = async () => {
        setLoading(true);
        try {
            const result = await feedService.getComments(postId);
            const comments = (result as any).data?.comments || result.comments || [];
            

            
            // S'assurer que chaque commentaire a un ID unique
            const uniqueComments = comments.filter(
                (comment: any, index: number, self: any[]) =>
                    comment.id &&
                    self.findIndex((c: any) => c.id === comment.id) === index
            );

            setComments(uniqueComments);
            if (onCommentsCountChange) {
                onCommentsCountChange(
                    (result as any).data?.total_count || result.total_count || 0
                );
            }
        } catch (error) {
            console.error("Erreur lors du chargement des commentaires:", error);
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    // Ajouter un nouveau commentaire
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const result = await feedService.addComment(
                postId,
                newComment.trim()
            );
            // Gérer les deux structures possibles
            const commentToAdd = (result as any).data || result;
            
            if (commentToAdd) {
                setComments((prev) => [commentToAdd, ...prev]);
                setNewComment("");
                if (onCommentsCountChange) {
                    onCommentsCountChange(comments.length + 1);
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Modifier un commentaire
    const handleEditComment = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            const result = await feedService.updateComment(
                commentId,
                editContent.trim()
            );
            if (result) {
                setComments((prev) =>
                    prev.map((comment) =>
                        comment.id === commentId ? result : comment
                    )
                );
                setEditingComment(null);
                setEditContent("");
            }
        } catch (error) {
            console.error(
                "Erreur lors de la modification du commentaire:",
                error
            );
        }
    };

    // Supprimer un commentaire
    const handleDeleteComment = async (commentId: string) => {
        try {
            await feedService.deleteComment(commentId);
            setComments((prev) =>
                prev.filter((comment) => comment.id !== commentId)
            );
            if (onCommentsCountChange) {
                onCommentsCountChange(comments.length - 1);
            }
        } catch (error) {
            console.error(
                "Erreur lors de la suppression du commentaire:",
                error
            );
        }
    };

    // Signaler un commentaire
    const handleReportComment = (comment: Comment) => {
        setCommentToReport(comment);
        setReportModalOpened(true);
    };

    // Trier les commentaires
    const sortComments = (comments: Comment[], order: 'newest' | 'oldest'): Comment[] => {
        return [...comments].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
    };

    // Basculer l'ordre de tri
    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
        setSortOrder(newOrder);
    };

    // Charger les commentaires quand la section s'ouvre
    useEffect(() => {
        if (showComments && comments.length === 0) {
            loadComments();
        }
    }, [showComments]);

    return (
        <Box>
            {/* Section des commentaires */}
            {showComments && (
                <Box mt="sm">
                    <Divider mb="md" />
                    <Stack gap="md">
                        {/* Formulaire d'ajout de commentaire */}
                        <Box>
                            <Textarea
                                placeholder="Ajouter un commentaire..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                minRows={2}
                                maxRows={4}
                                autosize
                            />
                            <Group justify="space-between" mt="xs">
                                {/* Bouton de tri */}
                                <Tooltip label={sortOrder === 'newest' ? 'Plus récents en premier' : 'Plus anciens en premier'}>
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        onClick={toggleSortOrder}
                                        color="gray"
                                    >
                                        {sortOrder === 'newest' ? (
                                            <IconSortDescending size={16} />
                                        ) : (
                                            <IconSortAscending size={16} />
                                        )}
                                    </ActionIcon>
                                </Tooltip>

                                {/* Bouton Commenter */}
                                <Button
                                    size="sm"
                                    leftSection={<IconSend size={14} />}
                                    onClick={handleAddComment}
                                    loading={submitting}
                                    disabled={!newComment.trim()}
                                >
                                    Commenter
                                </Button>
                            </Group>
                        </Box>

                        <Divider />

                        {/* Liste des commentaires */}
                        {loading ? (
                            <Text c="dimmed" ta="center">
                                Chargement des commentaires...
                            </Text>
                        ) : comments.length === 0 ? (
                            <Text c="dimmed" ta="center">
                                Aucun commentaire pour le moment.
                            </Text>
                        ) : (
                            <Stack gap="md">
                                {sortComments(comments, sortOrder).map((comment, index) => (
                                    <Box key={comment.id || `comment-${index}`}>
                                        <Group align="flex-start" gap="sm">
                                            <Avatar
                                                src={comment.users?.avatar_url || (comment as any).avatar_url || (comment as any).author?.avatar_url}
                                                size="sm"
                                                radius="xl"
                                            />
                                            <Box style={{ flex: 1 }}>
                                                <Group gap="xs" mb={4}>
                                                    <Text size="sm" fw={500}>
                                                        {comment.users?.display_name || 
                                                         (comment as any).display_name ||
                                                         (comment as any).author?.display_name ||
                                                         "Utilisateur"}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {formatCommentDate(
                                                            comment.created_at
                                                        )}
                                                    </Text>
                                                </Group>

                                                {editingComment ===
                                                comment.id ? (
                                                    <Box>
                                                        <Textarea
                                                            value={editContent}
                                                            onChange={(e) =>
                                                                setEditContent(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            minRows={2}
                                                            autosize
                                                        />
                                                        <Group gap="xs" mt="xs">
                                                            <Button
                                                                size="xs"
                                                                onClick={() =>
                                                                    handleEditComment(
                                                                        comment.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    !editContent.trim()
                                                                }
                                                            >
                                                                Sauvegarder
                                                            </Button>
                                                            <Button
                                                                size="xs"
                                                                variant="subtle"
                                                                onClick={() => {
                                                                    setEditingComment(
                                                                        null
                                                                    );
                                                                    setEditContent(
                                                                        ""
                                                                    );
                                                                }}
                                                            >
                                                                Annuler
                                                            </Button>
                                                        </Group>
                                                    </Box>
                                                ) : (
                                                    <Text
                                                        size="sm"
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                        }}
                                                    >
                                                        {comment.content ||
                                                            "Contenu vide"}
                                                    </Text>
                                                )}
                                            </Box>

                                            {/* Menu d'actions pour le commentaire */}
                                            <Menu shadow="md" width={160}>
                                                <Menu.Target>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="sm"
                                                    >
                                                        <IconDotsVertical
                                                            size={14}
                                                        />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={
                                                            <IconEdit
                                                                size={14}
                                                            />
                                                        }
                                                        onClick={() => {
                                                            setEditingComment(
                                                                comment.id
                                                            );
                                                            setEditContent(
                                                                comment.content
                                                            );
                                                        }}
                                                    >
                                                        Modifier
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={
                                                            <IconTrash
                                                                size={14}
                                                            />
                                                        }
                                                        color="red"
                                                        onClick={() =>
                                                            handleDeleteComment(
                                                                comment.id
                                                            )
                                                        }
                                                    >
                                                        Supprimer
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={
                                                            <IconFlag
                                                                size={14}
                                                            />
                                                        }
                                                        color="orange"
                                                        onClick={() => handleReportComment(comment)}
                                                    >
                                                        Signaler
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Box>
            )}

            {/* Modal de signalement */}
            <ReportPostModal
                opened={reportModalOpened}
                onClose={() => {
                    setReportModalOpened(false);
                    setCommentToReport(null);
                }}
                commentId={commentToReport?.id}
                commentContent={commentToReport?.content}
                type="comment"
            />
        </Box>
    );
};

export default CommentSection;
