import React, { useState, useEffect } from "react";
import { Stack, Title, Alert, Text, Box, Container, Group, ThemeIcon, ActionIcon, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconNews, IconTrendingUp } from "@tabler/icons-react";
import MainLayout from "../layouts/MainLayout";
import PostForm from "../components/PostForm";
import FeedList from "../components/FeedList";
import ReportPostModal from "../components/ReportPostModal";
import type { Post, AuthButtonProps } from "../types";
import { feedService } from "../services/feedService";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const FeedPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [reportModalOpened, setReportModalOpened] = useState(false);
    const [reportingPost, setReportingPost] = useState<{
        id: string;
        title?: string;
    } | null>(null);
    const navigate = useNavigate();
    const { logout } = useUserContext();

    // Charger les posts au montage du composant
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoadingPosts(true);
        setError(null);

        try {
            const response = await feedService.getPosts();
            if (response && response.posts !== undefined) {
                const postsArray = response.posts;

                const transformedPosts: Post[] = postsArray.map((post: any) => {
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
                        author: {
                            id: post.author?.id || post.author_id,
                            name: post.author?.name || "Utilisateur",
                            display_name:
                                post.author?.display_name || "Utilisateur",
                            avatar_url:
                                post.author?.avatar_url ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                                    post.author?.id || post.author_id
                                }`,
                            institution:
                                post.author?.institution || "MGR Parent",
                        },
                        content: post.content,
                        visibility: post.visibility,
                        createdAt: new Date(post.created_at),
                        files: transformedFiles,
                        hashtags: post.hashtags || [],
                        likes: post.likes_count || 0,
                        comments: post.comments_count || 0,
                        hasLiked: post.hasLiked || false,
                    };
                });

                setPosts(transformedPosts);
            } else {
                setError("Erreur lors du chargement des posts");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleCreatePost = async (
        title: string,
        content: string,
        visibility: "public" | "private",
        files: File[] = []
    ) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            let response;
            if (files.length > 0) {
                response = await feedService.createPostWithFiles(
                    {
                        title,
                        content,
                        visibility,
                    },
                    files
                );
            } else {
                response = await feedService.createPost({
                    title,
                    content,
                    visibility,
                });
            }

            if (response) {
                setSuccess(true);
                // Transformer le nouveau post
                const newPost: Post = {
                    id: response.id,
                    title: response.title,
                    author: {
                        id: response.author_id,
                        name: response.author?.name || "Vous",
                        display_name: response.author?.display_name || "Vous",
                        avatar_url:
                            response.author?.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.author_id}`,
                        institution: "MGR Parent", // Pour l'instant, utiliser une valeur par défaut
                    },
                    content: response.content,
                    visibility: response.visibility,
                    createdAt: new Date(response.created_at),
                };

                // Ajouter le nouveau post au début de la liste
                setPosts((prev) => [newPost, ...prev]);

                // Recharger les posts pour avoir les données complètes
                await loadPosts();
            } else {
                setError("Erreur lors de la création du post");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    // Gestion du signalement de posts
    const handleReportPost = (postId: string, postTitle?: string) => {
        setReportingPost({ id: postId, title: postTitle });
        setReportModalOpened(true);
    };

    const closeReportModal = () => {
        setReportModalOpened(false);
        setReportingPost(null);
    };

    const { user } = useUserContext();

    const authProps: AuthButtonProps = {
        isAuthenticated: true,
        onLogin: () => navigate("/login"),
        onLogout: logout,
        onProfile: () => navigate("/profile"),
        userAvatar:
            user?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                user?.id || Date.now()
            }`,
        userName: user?.name || "Utilisateur",
    };

    return (
        <MainLayout authProps={authProps}>
                <Stack gap="xl">
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconNews size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Fil d'actualité
                            </Title>
                            <Text c="dimmed" size="sm">
                                Découvrez les dernières publications de vos établissements
                            </Text>
                        </div>
                    </Group>
                    <Tooltip label="Voir les hashtags tendances" position="left">
                        <ActionIcon
                            variant="filled"
                            color="violet"
                            size="lg"
                            radius="md"
                            onClick={() => navigate("/trending")}
                            style={{
                                boxShadow: "0 4px 12px rgba(139, 69, 219, 0.3)",
                            }}
                        >
                            <IconTrendingUp size={20} />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                        {error && (
                            <Alert
                                icon={<IconAlertCircle size={16} />}
                                title="Erreur"
                                color="red"
                                variant="light"
                            >
                                <Text size="sm" c="#ef4444" fw={600}>
                                    {error}
                                </Text>
                            </Alert>
                        )}

                    <Box w="100%">
                        <PostForm
                            onSubmit={handleCreatePost}
                            loading={loading}
                            success={success}
                        />
                    </Box>

                    <Box>
                        <FeedList
                            posts={posts}
                            loading={loadingPosts}
                            onReport={handleReportPost}
                        />
                    </Box>
                </Stack>

            <ReportPostModal
                opened={reportModalOpened}
                onClose={closeReportModal}
                postId={reportingPost?.id || ""}
                postTitle={reportingPost?.title}
                type="post"
            />
        </MainLayout>
    );
};

export default FeedPage;
