import React, { useState, useEffect } from "react";
import {
    Card,
    Text,
    Group,
    Badge,
    Avatar,
    Stack,
    ActionIcon,
    Divider,
    Box,
    Tooltip,
    Button,
    Menu,
    Modal,
} from "@mantine/core";

// Fonction pour rendre le contenu avec les hashtags transformés en badges
const renderContentWithHashtags = (content: string) => {
    if (!content) return content;

    // Regex pour détecter les hashtags
    const hashtagRegex = /#([a-zA-Z0-9\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+)/g;

    // Diviser le contenu en parties (texte et hashtags)
    const parts = content.split(hashtagRegex);

    return parts.map((part, index) => {
        // Si l'index est impair, c'est un hashtag (capturé par le groupe)
        if (index % 2 === 1) {
            return (
                <Badge
                    key={index}
                    variant="filled"
                    color="grape"
                    size="xs"
                    style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 2px',
                        verticalAlign: 'middle',
                        transform: 'translateY(-1px)',
                        fontSize: '10px',
                        height: '16px',
                        lineHeight: '1',
                        padding: '0 4px'
                    }}
                    onClick={() => {
                        window.location.href = `/hashtag/${part.toLowerCase()}`;
                    }}
                >
                    #{part}
                </Badge>
            );
        }
        // Sinon, c'est du texte normal
        return part;
    });
};

import {
    IconFlag,
    IconClock,
    IconBuilding,
    IconHeart,
    IconHeartFilled,
    IconMessageCircle,
    IconDotsVertical,
    IconEye,
    IconEyeOff,
    IconFile,
    IconFileText,
    IconFileCode,
    IconPhoto,
    IconFileTypePdf,
} from "@tabler/icons-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import styles from "./PostCard.module.css";
import { feedService } from "../services/feedService";
import CommentSection from "./CommentSection";

export interface PostCardProps {
    id: string;
    title?: string;
    author: {
        id: string;
        name: string;
        display_name: string;
        avatar_url: string;
        institution_id: string;
        institution: string;
    };
    content: string;
    visibility: "public" | "private";
    createdAt: string | Date;
    files?: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url: string;
    }>;
    hashtags?: string[];
    likes?: number;
    comments?: number;
    isLiked?: boolean;
    hasLiked?: boolean; // Nouveau: état like depuis le serveur
    onReport?: (postId: string, postTitle?: string) => void;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
    id,
    title,
    author,
    content,
    visibility,
    createdAt,
    files = [],
    hashtags = [],
    likes = 0,
    comments = 0,
    isLiked = false,
    hasLiked = false,
    onReport,
    onLike,
    onComment,
}) => {
    const [localLikes, setLocalLikes] = useState(likes);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const [localCommentsCount, setLocalCommentsCount] = useState(comments || 0);
    const [showComments, setShowComments] = useState(false);

    // Initialiser l'état avec les données du serveur
    useEffect(() => {
        if (hasLiked !== undefined) {
            setLocalIsLiked(hasLiked);
        }
        if (likes !== undefined) {
            setLocalLikes(likes);
        }
    }, [hasLiked, likes]);
    const [imageModalOpened, setImageModalOpened] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string>("");

    const formatDate = (date: string | Date) => {
        try {
            const dateObj = typeof date === "string" ? new Date(date) : date;
            const now = new Date();
            const diffInHours =
                (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);

            // Si moins de 24h, afficher le temps relatif
            if (diffInHours < 24) {
                return formatDistanceToNow(dateObj, {
                    addSuffix: true,
                    locale: fr,
                });
            }

            // Sinon, afficher la date complète
            return format(dateObj, "dd MMM yyyy à HH:mm", { locale: fr });
        } catch {
            return String(date);
        }
    };

    const getVisibilityColor = (vis: "public" | "private") => {
        return vis === "public" ? "violet" : "yellow";
    };

    const getVisibilityLabel = (vis: "public" | "private") => {
        return vis === "public" ? "Public" : "Privé";
    };

    const handleLike = async () => {
        try {
            const result = await feedService.toggleLike(id);

            // Gérer les deux structures possibles
            const likeData = (result as any).data || result;

            setLocalLikes(likeData.likes_count);
            setLocalIsLiked(likeData.liked);

            // Appeler le callback si fourni
            if (onLike) {
                onLike(id);
            }
        } catch (error) {
            console.error("Erreur lors du toggle like:", error);
        }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith("image/")) return <IconPhoto size={16} />;
        if (fileType.includes("pdf")) return <IconFileTypePdf size={16} />;
        if (fileType.includes("text") || fileType.includes("document"))
            return <IconFileText size={16} />;
        if (fileType.includes("code") || fileType.includes("script"))
            return <IconFileCode size={16} />;
        return <IconFile size={16} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleFileClick = async (file: any) => {
        try {
            if (file.type.startsWith("image/")) {
                // Pour les images, utiliser l'URL directe de Supabase
                setSelectedImage(file.url);
                setImageModalOpened(true);
            } else if (
                file.type === "application/pdf" ||
                file.type.startsWith("text/")
            ) {
                // Pour les PDFs et fichiers texte, utiliser l'URL directe de Supabase
                // Les PDFs s'ouvrent mieux directement dans le navigateur
                window.open(file.url, "_blank");
            } else {
                // Télécharger le fichier via notre API
                const token = localStorage.getItem("authToken");
                const response = await fetch(
                    `http://localhost:3001/api/feed/files/${encodeURIComponent(
                        (file as any).path
                    )}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Erreur lors du traitement du fichier:", error);
            // Fallback: essayer l'URL directe
            window.open(file.url, "_blank");
        }
    };

    return (
        <Card
            withBorder
            padding="lg"
            radius="lg"
            shadow="sm"
            className={styles.postCard}
        >
            {/* Header avec avatar et informations de l'auteur */}
            <Group justify="space-between" align="flex-start" mb="md">
                <Group gap="md" align="flex-start">
                    <Avatar
                        src={author.avatar_url}
                        size="lg"
                        radius="xl"
                        alt={`Avatar de ${author.display_name}`}
                        className={styles.avatar}
                    />
                    <Stack gap={4}>
                        <Text fw={700} size="md" c="dark.7">
                            {author.display_name}
                        </Text>
                        <Group gap="xs" align="center">
                            <IconBuilding
                                size={14}
                                color="var(--mantine-color-gray-6)"
                            />
                            <Text size="xs" c="dimmed" fw={500}>
                                {author.institution}
                            </Text>
                        </Group>
                    </Stack>
                </Group>

                <Group gap="xs" align="center">
                    <Badge
                        variant="gradient"
                        gradient={{
                            from: visibility === "public" ? "violet" : "yellow",
                            to: visibility === "public" ? "grape" : "orange",
                            deg: 45,
                        }}
                        size="sm"
                        radius="md"
                        className={styles.visibilityBadge}
                        style={{
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        <Group gap={4} align="center">
                            {visibility === "public" ? (
                                <IconEye size={12} />
                            ) : (
                                <IconEyeOff size={12} />
                            )}
                            {getVisibilityLabel(visibility)}
                        </Group>
                    </Badge>

                    {onReport && (
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    size="sm"
                                    className={styles.menuButton}
                                >
                                    <IconDotsVertical size={16} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconFlag size={14} />}
                                    color="red"
                                    onClick={() => onReport(id, title)}
                                >
                                    Signaler
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </Group>
            </Group>

            <Divider mb="md" color="gray.2" />

            {/* Contenu du post */}
            <Stack gap="md">
                {title && (
                    <Box>
                        <Text
                            fw={700}
                            size="lg"
                            c="dark.8"
                            className={styles.postTitle}
                        >
                            {title}
                        </Text>
                    </Box>
                )}

                <Box>
                    <div
                        style={{
                            fontSize: '14px',
                            color: 'var(--mantine-color-dark-7)',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap'
                        }}
                        className={styles.postContent}
                    >
                        {renderContentWithHashtags(content)}
                    </div>
                </Box>

                {/* Affichage des fichiers */}
                {files.length > 0 && (
                    <Box mt="lg">
                        <Text size="sm" fw={600} c="dark.6" mb="xs">
                            Fichiers joints ({files.length})
                        </Text>
                        <Stack gap="xs">
                            {files.map((file, index) => (
                                <Group
                                    key={file.id || `file-${index}`}
                                    gap="sm"
                                    p="xs"
                                    style={{
                                        backgroundColor:
                                            "var(--mantine-color-gray-0)",
                                        borderRadius: "8px",
                                        border: "1px solid var(--mantine-color-gray-2)",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                    onClick={() => handleFileClick(file)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "var(--mantine-color-gray-1)";
                                        e.currentTarget.style.borderColor =
                                            "var(--mantine-color-violet-3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "var(--mantine-color-gray-0)";
                                        e.currentTarget.style.borderColor =
                                            "var(--mantine-color-gray-2)";
                                    }}
                                >
                                    <Box
                                        style={{
                                            color: "var(--mantine-color-violet-6)",
                                        }}
                                    >
                                        {getFileIcon(file.type)}
                                    </Box>
                                    <Text
                                        size="sm"
                                        fw={500}
                                        style={{ flex: 1 }}
                                    >
                                        {file.name}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {formatFileSize(file.size)}
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>

            {/* Actions du post */}
            <Group justify="space-between" align="center" mt="md">
                <Group gap="xs">
                    <Tooltip
                        label={localIsLiked ? "Retirer le like" : "Aimer"}
                    >
                        <Button
                            variant="light"
                            color={localIsLiked ? "violet" : "gray"}
                            size="sm"
                            leftSection={
                                localIsLiked ? (
                                    <IconHeartFilled size={16} />
                                ) : (
                                    <IconHeart size={16} />
                                )
                            }
                            onClick={handleLike}
                            className={styles.actionButton}
                            style={{
                                backgroundColor: localIsLiked
                                    ? "var(--mantine-color-violet-0)"
                                    : "var(--mantine-color-gray-0)",
                                borderColor: localIsLiked
                                    ? "var(--mantine-color-violet-3)"
                                    : "var(--mantine-color-gray-3)",
                            }}
                        >
                            {localLikes}
                        </Button>
                    </Tooltip>

                    <Tooltip label="Commenter">
                        <Button
                            variant="light"
                            color="gray"
                            size="sm"
                            leftSection={<IconMessageCircle size={16} />}
                            onClick={() => setShowComments(!showComments)}
                            className={styles.actionButton}
                            style={{
                                backgroundColor: "var(--mantine-color-gray-0)",
                                borderColor: "var(--mantine-color-gray-3)",
                            }}
                        >
                            {localCommentsCount}
                        </Button>
                    </Tooltip>
                </Group>

                <Group gap="xs" align="center">
                    <IconClock size={14} color="var(--mantine-color-gray-5)" />
                    <Text size="xs" c="dimmed" fw={500}>
                        {formatDate(createdAt)}
                    </Text>
                </Group>
            </Group>

            {/* Modal pour afficher les images */}
            <Modal
                opened={imageModalOpened}
                onClose={() => setImageModalOpened(false)}
                size="lg"
                centered
                title="Aperçu de l'image"
            >
                <Box>
                    <img
                        src={selectedImage}
                        alt="Aperçu"
                        style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                        }}
                        onError={(e) => {
                            console.error(
                                "Erreur lors du chargement de l'image:",
                                e
                            );
                        }}
                    />
                </Box>
            </Modal>

            {/* Section des commentaires */}
            <Box>
                <CommentSection
                    postId={id}
                    commentsCount={localCommentsCount}
                    onCommentsCountChange={setLocalCommentsCount}
                    showComments={showComments}
                    onToggleComments={() => setShowComments(!showComments)}
                />
            </Box>
        </Card>
    );
};

export default PostCard;
