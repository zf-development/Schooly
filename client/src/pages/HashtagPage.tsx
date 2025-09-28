import React, { useState, useEffect } from "react";
import {
    Stack,
    Title,
    Text,
    Group,
    Badge,
    Box,
    Alert,
    Loader,
    Center,
    Button,
    ActionIcon,
    Tooltip,
    ThemeIcon,
} from "@mantine/core";
import { IconHash, IconArrowLeft, IconRefresh, IconAlertCircle } from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import FeedList from "../components/FeedList";
import type { Post, AuthButtonProps } from "../types";
import { feedService } from "../services/feedService";
import { useUserContext } from "../contexts/UserContext";

const HashtagPage: React.FC = () => {
    const { hashtag } = useParams<{ hashtag: string }>();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { logout } = useUserContext();

    useEffect(() => {
        if (hashtag) {
            loadPosts();
        }
    }, [hashtag]);

    const loadPosts = async () => {
        if (!hashtag) return;

        setLoadingPosts(true);
        setError(null);

        try {
            const response = await feedService.searchByHashtag(hashtag);
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
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadPosts();
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

    if (loading) {
        return (
            <MainLayout authProps={authProps}>
                <Center py="xl">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    return (
        <MainLayout authProps={authProps}>
            <Stack gap="xl">
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group>
                        <ActionIcon
                            variant="light"
                            color="violet"
                            size="lg"
                            onClick={() => navigate(-1)}
                        >
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconHash size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                #{hashtag}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {posts.length} post{posts.length !== 1 ? 's' : ''} trouvé{posts.length !== 1 ? 's' : ''}
                            </Text>
                        </div>
                    </Group>
                    <Tooltip label="Actualiser">
                        <ActionIcon
                            variant="light"
                            color="violet"
                            size="lg"
                            onClick={handleRefresh}
                            loading={loadingPosts}
                        >
                            <IconRefresh size={20} />
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
                        {error}
                    </Alert>
                )}

                {/* Liste des posts */}
                <Box>
                    {posts.length > 0 ? (
                        <FeedList
                            posts={posts}
                            loading={loadingPosts}
                        />
                    ) : (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <IconHash size={48} color="gray" />
                                <Text c="dimmed" size="lg">
                                    Aucun post trouvé pour #{hashtag}
                                </Text>
                                <Text c="dimmed" size="sm">
                                    Essayez de rechercher d'autres hashtags
                                </Text>
                                <Button
                                    variant="light"
                                    color="violet"
                                    onClick={() => navigate("/trending")}
                                >
                                    Voir les hashtags tendances
                                </Button>
                            </Stack>
                        </Center>
                    )}
                </Box>
            </Stack>
        </MainLayout>
    );
};

export default HashtagPage;
