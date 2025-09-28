import React, { useState, useEffect } from "react";
import {
    Stack,
    Title,
    Text,
    Group,
    Badge,
    Card,
    Grid,
    Box,
    Alert,
    Loader,
    Center,
    Button,
    TextInput,
    ActionIcon,
    Tooltip,
    ThemeIcon,
} from "@mantine/core";
import { IconHash, IconSearch, IconTrendingUp, IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import MainLayout from "../layouts/MainLayout";
import type { AuthButtonProps } from "../types";
import { feedService } from "../services/feedService";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

interface TrendingHashtag {
    hashtag: string;
    count: number;
}

const TrendingHashtagsPage: React.FC = () => {
    const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
    const [allHashtags, setAllHashtags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredHashtags, setFilteredHashtags] = useState<string[]>([]);
    const navigate = useNavigate();
    const { logout } = useUserContext();

    useEffect(() => {
        loadTrendingHashtags();
        loadAllHashtags();
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = allHashtags.filter(hashtag =>
                hashtag.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredHashtags(filtered);
        } else {
            setFilteredHashtags([]);
        }
    }, [searchTerm, allHashtags]);

    const loadTrendingHashtags = async () => {
        try {
            setLoading(true);
            setError(null);
            const hashtags = await feedService.getTrendingHashtags(20);
            setTrendingHashtags(hashtags);
        } catch (err) {
            setError("Erreur lors du chargement des hashtags tendances");
        } finally {
            setLoading(false);
        }
    };

    const loadAllHashtags = async () => {
        try {
            const hashtags = await feedService.getAllHashtags();
            setAllHashtags(hashtags);
        } catch (err) {
            console.error("Erreur lors du chargement de tous les hashtags:", err);
        }
    };

    const handleHashtagClick = (hashtag: string) => {
        navigate(`/hashtag/${hashtag}`);
    };

    const handleRefresh = () => {
        loadTrendingHashtags();
        loadAllHashtags();
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

    const getHashtagColor = (index: number) => {
        const colors = [
            "violet",
            "blue",
            "green",
            "orange",
            "red",
            "pink",
            "grape",
            "cyan",
            "lime",
            "yellow"
        ];
        return colors[index % colors.length];
    };

    const getHashtagSize = (count: number) => {
        if (count >= 10) return "lg";
        if (count >= 5) return "md";
        return "sm";
    };

    return (
        <MainLayout authProps={authProps}>
            <Stack gap="xl">
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconTrendingUp size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Hashtags Tendances
                            </Title>
                            <Text c="dimmed" size="sm">
                                Découvrez les sujets les plus discutés dans votre établissement
                            </Text>
                        </div>
                    </Group>
                    <Tooltip label="Actualiser">
                        <ActionIcon
                            variant="light"
                            color="violet"
                            size="lg"
                            onClick={handleRefresh}
                            loading={loading}
                        >
                            <IconRefresh size={20} />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                {/* Barre de recherche */}
                <Card shadow="sm" padding="md" radius="md">
                    <TextInput
                        placeholder="Rechercher un hashtag..."
                        leftSection={<IconSearch size={16} />}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.currentTarget.value)}
                        rightSection={
                            searchTerm && (
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    onClick={() => setSearchTerm("")}
                                >
                                    Effacer
                                </Button>
                            )
                        }
                    />
                </Card>

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

                {loading ? (
                    <Center py="xl">
                        <Loader size="lg" />
                    </Center>
                ) : (
                    <>
                        {/* Résultats de recherche */}
                        {searchTerm && (
                            <Box>
                                <Title order={3} size="h4" mb="md">
                                    Résultats pour "{searchTerm}"
                                </Title>
                                {filteredHashtags.length > 0 ? (
                                    <Group gap="sm">
                                        {filteredHashtags.map((hashtag, index) => (
                                            <Badge
                                                key={index}
                                                variant="filled"
                                                color="grape"
                                                size="md"
                                                leftSection={<IconHash size={14} />}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleHashtagClick(hashtag)}
                                            >
                                                {hashtag}
                                            </Badge>
                                        ))}
                                    </Group>
                                ) : (
                                    <Text c="dimmed">Aucun hashtag trouvé</Text>
                                )}
                            </Box>
                        )}

                        {/* Hashtags tendances */}
                        {!searchTerm && (
                            <Box>
                                <Title order={3} size="h4" mb="md">
                                    Top {trendingHashtags.length} Hashtags
                                </Title>
                                {trendingHashtags.length > 0 ? (
                                    <Grid>
                                        {trendingHashtags.map((item, index) => (
                                            <Grid.Col key={item.hashtag} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                                                <Card
                                                    shadow="sm"
                                                    padding="md"
                                                    radius="md"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleHashtagClick(item.hashtag)}
                                                    className="hover-card"
                                                >
                                                    <Group justify="space-between" align="center">
                                                        <Group gap="xs">
                                                            <IconHash size={16} color="violet" />
                                                            <Text fw={600} size="sm">
                                                                #{item.hashtag}
                                                            </Text>
                                                        </Group>
                                                        <Badge
                                                            color="grape"
                                                            size={getHashtagSize(item.count)}
                                                            variant="filled"
                                                        >
                                                            {item.count} posts
                                                        </Badge>
                                                    </Group>
                                                </Card>
                                            </Grid.Col>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Text c="dimmed">Aucun hashtag disponible pour le moment</Text>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Stack>
        </MainLayout>
    );
};

export default TrendingHashtagsPage;
