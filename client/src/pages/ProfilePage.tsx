import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Stack,
    Title,
    Paper,
    Container,
    Alert,
    Text,
    TextInput,
    Button,
    Group,
    Divider,
    Skeleton,
    Card,
    Badge,
    Avatar,
    Grid,
    Box,
    Progress,
    ActionIcon,
    Tooltip,
    Modal,
    FileInput,
    Select,
    Switch,
    ThemeIcon,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconCheck,
    IconX,
    IconUser,
    IconUserScan,
    IconEdit,
    IconCamera,
    IconSchool,
    IconBook,
    IconStar,
    IconSettings,
    IconPalette,
    IconWorld,
    IconUpload,
    IconCalendar,
    IconHash,
    IconTrophy,
    IconChartBar,
    IconTarget,
    IconUsers,
} from "@tabler/icons-react";
import MainLayout from "../layouts/MainLayout";
import type { AuthButtonProps } from "../types";
import userService from "../services/userService";
import { useUserContext } from "../contexts/UserContext";

interface UserProfile {
    id: string;
    email: string;
    institution_id: string;
    display_name: string;
    full_name?: string;
    avatar_url: string;
    inscription_date?: string;
    file_number?: string;
    school?: string;
    group_number?: string;
    education_level?: string;
    posts_count?: number;
    xp_points?: number;
    preferred_tags?: string[];
    academic_projects?: string[];
    created_at?: string;
    updated_at?: string;
}

interface UserStats {
    posts_count: number;
    xp_points: number;
    level: number;
    progress_to_next_level: number;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    unlocked: boolean;
    unlocked_at?: string;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    unlocked: boolean;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { logout, user, setUser } = useUserContext();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fonction pour formater la date d'inscription
    const formatInscriptionDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            // Format français propre : "19 août 2025"
            return date.toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            // Fallback vers un format simple si la date est invalide
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            } catch {
                return "2024";
            }
        }
    };

    // Fonction pour convertir les noms d'icônes en composants React
    const getBadgeIcon = (iconName: string) => {
        const iconMap: { [key: string]: React.ReactNode } = {
            IconEdit: <IconEdit size={24} />,
            IconTarget: <IconTarget size={24} />,
            IconTrophy: <IconTrophy size={24} />,
            IconUsers: <IconUsers size={24} />,
        };
        return iconMap[iconName] || <IconStar size={24} />;
    };

    // États pour l'édition
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<Partial<UserProfile>>({});
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);

    // États pour les préférences
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState("fr");

    // États pour les données dynamiques
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await userService.getMe();

            if (response.success && response.data) {
                const profileData = {
                    ...response.data,
                    posts_count: response.data.posts_count || 0,
                    xp_points: response.data.xp_points || 150,
                    preferred_tags: response.data.preferred_tags || [
                        "Mathématiques",
                        "Physique",
                        "Informatique",
                    ],
                    academic_projects: response.data.academic_projects || [
                        "Projet de fin d'études",
                        "Recherche en IA",
                    ],
                    school: response.data.school || "Université de Montréal",
                    group_number: response.data.group_number || "G-2024-01",
                    education_level:
                        response.data.education_level || "Universitaire",
                };

                setProfile(profileData);
                setEditData(profileData);

                // Mettre à jour le contexte utilisateur
                setUser({
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.display_name || "Utilisateur",
                    avatar_url: response.data.avatar_url,
                });

                // Charger les statistiques et badges
                await loadUserStats(response.data.id);
                await loadUserBadges(response.data.id);
            } else {
                setError(
                    response.error || "Erreur lors du chargement du profil"
                );
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    const loadUserStats = async (userId: string) => {
        try {
            const response = await userService.getUserStats();
            if (response.success && response.data) {
                setUserStats(response.data);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
        }
    };

    const loadUserBadges = async (userId: string) => {
        try {
            const response = await userService.getUserBadges();
            if (response.success && response.data) {
                setBadges(response.data);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des badges:", error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Filtrer seulement les champs modifiables
            const updateData: Partial<UserProfile> = {};

            if (editData.display_name !== profile?.display_name) {
                updateData.display_name = editData.display_name;
            }

            if (Object.keys(updateData).length === 0) {
                setSuccess("Aucune modification à sauvegarder");
                setSaving(false);
                return;
            }

            const response = await userService.updateMe(updateData);

            if (response.success && response.data) {
                setSuccess("Profil mis à jour avec succès !");
                setEditMode(false);
                await loadProfile();
            } else {
                setError(response.error || "Erreur lors de la mise à jour");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (file: File | null) => {
        if (!file) return;

        try {
            setError(null);
            setSuccess(null);

            const response = await userService.uploadAvatar(file);

            if (response.success && response.data) {
                setSuccess("Avatar mis à jour avec succès !");
                // Mettre à jour le profil local
                if (profile) {
                    setProfile({
                        ...profile,
                        avatar_url: response.data.avatar_url,
                    });
                }
                // Mettre à jour le contexte utilisateur
                if (user) {
                    setUser({
                        ...user,
                        avatar_url: response.data.avatar_url,
                    });
                }
                setAvatarModalOpen(false);
            } else {
                setError(
                    response.error || "Erreur lors de l'upload de l'avatar"
                );
            }
        } catch (err) {
            setError("Erreur lors de l'upload de l'avatar");
        }
    };

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
                <Container size="lg" py="xl">
                    <Stack gap="xl">
                        <Skeleton height={40} width="60%" mx="auto" />
                        <Paper p="xl" withBorder radius="lg">
                            <Stack gap="xl">
                                <Card p="lg" withBorder radius="md" bg="gray.0">
                                    <Stack gap="lg" align="center">
                                        <Skeleton
                                            height={120}
                                            width={120}
                                            radius="xl"
                                        />
                                        <Stack gap="xs" align="center">
                                            <Skeleton height={32} width="40%" />
                                            <Skeleton height={20} width="60%" />
                                        </Stack>
                                    </Stack>
                                </Card>
                                <Divider />
                                <Stack gap="lg">
                                    <Skeleton height={28} width="30%" />
                                    <Skeleton height={42} width="100%" />
                                    <Skeleton height={42} width="100%" />
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout authProps={authProps}>
            <Container size="xl" py="md">
                <Stack gap="xl">
                    {/* En-tête */}
                    <Group justify="space-between" align="center" mb="xl">
                        <Group>
                            <ThemeIcon size={40} radius="md" color="violet">
                                <IconUserScan size={24} />
                            </ThemeIcon>
                            <div>
                                <Title order={1} size="h2">
                                    Mon Profil
                                </Title>
                                <Text c="dimmed" size="sm">
                                    Gérez vos informations personnelles et vos préférences
                                </Text>
                            </div>
                        </Group>
                    </Group>

                    {error && (
                        <Alert
                            icon={<IconX size={16} />}
                            title="Erreur"
                            color="red"
                            variant="light"
                        >
                            <Text size="sm">{error}</Text>
                        </Alert>
                    )}

                    {success && (
                        <Alert
                            icon={<IconCheck size={16} />}
                            title="Succès"
                            color="green"
                            variant="light"
                        >
                            <Text size="sm">{success}</Text>
                        </Alert>
                    )}

                    {/* Section Profil Principal */}
                    <Paper p="xl" withBorder radius="lg">
                        <Group
                            justify="space-between"
                            align="flex-start"
                            mb="lg"
                        >
                            <Title order={2} size="h3">
                                <IconUser
                                    size={24}
                                    style={{ marginRight: 8 }}
                                />
                                Profil
                            </Title>
                            <Button
                                variant={editMode ? "filled" : "outline"}
                                color={editMode ? "violet" : "gray"}
                                leftSection={<IconEdit size={16} />}
                                onClick={() => setEditMode(!editMode)}
                            >
                                {editMode ? "Sauvegarder" : "Modifier"}
                            </Button>
                        </Group>

                        <Grid gutter="xl">
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Stack align="center" gap="md">
                                    <Box pos="relative">
                        <Avatar
                                            src={profile?.avatar_url}
                                            size={120}
                            radius="xl"
                            alt="Votre avatar"
                        />
                                        <Tooltip label="Changer l'avatar">
                                            <ActionIcon
                                                variant="filled"
                                                color="violet"
                                                size="lg"
                                                radius="xl"
                                                pos="absolute"
                                                bottom={0}
                                                right={0}
                                                onClick={() =>
                                                    setAvatarModalOpen(true)
                                                }
                                            >
                                                <IconCamera size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Box>

                                    <Stack gap="xs" align="center">
                                        <Title order={3} size="h4">
                                            {profile?.display_name ||
                                                "Utilisateur"}
                                        </Title>
                                        <Group gap="xs" justify="center">
                                            <IconCalendar
                                                size={14}
                                                color="gray"
                                            />
                                            <Text c="dimmed" size="sm">
                                                Membre depuis{" "}
                                                <Text
                                                    component="span"
                                                    fw={500}
                                                    c="violet"
                                                >
                                                    {profile?.inscription_date
                                                        ? formatInscriptionDate(
                                                              profile.inscription_date
                                                          )
                                                        : "2024"}
                                                </Text>
                        </Text>
                                        </Group>
                                        <Badge variant="light" color="violet">
                                            <Group gap="xs" align="center">
                                                <IconHash size={12} />
                                                {profile?.file_number || "0001"}
                                            </Group>
                                        </Badge>
                                    </Stack>
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 8 }}>
                                <Stack gap="md">
                                    <TextInput
                                        label="Nom d'affichage"
                                        value={
                                            editMode
                                                ? editData.display_name
                                                : profile?.display_name
                                        }
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                display_name: e.target.value,
                                            })
                                        }
                                        disabled={!editMode}
                                        leftSection={<IconUser size={16} />}
                                    />
                                    <TextInput
                                        label="Nom complet"
                                    value={profile?.full_name || ""}
                                    disabled
                                        leftSection={<IconUser size={16} />}
                                    />
                                    <TextInput
                                        label="Adresse courriel"
                                        value={profile?.email}
                                        disabled
                                        leftSection={<IconUser size={16} />}
                                    />
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Section Académique */}
                    <Paper p="xl" withBorder radius="lg">
                        <Title order={2} size="h3" mb="lg">
                            <IconSchool size={24} style={{ marginRight: 8 }} />
                            Académique
                        </Title>

                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <TextInput
                                    label="École"
                                    value={profile?.school || ""}
                                    disabled
                                    leftSection={<IconSchool size={16} />}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <TextInput
                                    label="Numéro de groupe"
                                    value={profile?.group_number || ""}
                                    disabled
                                    leftSection={<IconSchool size={16} />}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <TextInput
                                    label="Niveau d'études"
                                    value={profile?.education_level || ""}
                                    disabled
                                    leftSection={<IconSchool size={16} />}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Section Profil Public */}
                    <Paper p="xl" withBorder radius="lg">
                        <Title order={2} size="h3" mb="lg">
                            <IconBook size={24} style={{ marginRight: 8 }} />
                            Profil Public
                        </Title>

                        <Stack gap="xl">
                            <Group grow align="flex-start" gap="xl">
                                {/* Colonne gauche - Statistiques et Tags */}
                                <Stack gap="lg" style={{ flex: 1 }}>
                                    <Card p="md" withBorder>
                                        <Group gap="xs" mb="md">
                                            <IconStar size={20} color="gold" />
                                            <Text fw={600}>Statistiques</Text>
                                        </Group>
                                        <Stack gap="md">
                                            <Group
                                                justify="space-between"
                                                align="center"
                                            >
                                                <Text>Posts publiés</Text>
                                                <Badge
                                                    size="lg"
                                                    variant="light"
                                                    color="violet"
                                                >
                                                    {userStats?.posts_count ||
                                                        profile?.posts_count ||
                                                        0}
                                                </Badge>
                                            </Group>
                                            <Group
                                                justify="space-between"
                                                align="center"
                                            >
                                                <Text>Points d'XP</Text>
                                                <Badge
                                                    size="lg"
                                                    variant="light"
                                                    color="green"
                                                >
                                                    {userStats?.xp_points ||
                                                        profile?.xp_points ||
                                                        0}
                                                </Badge>
                                            </Group>
                                            {userStats && (
                                                <>
                                                    <Group
                                                        justify="space-between"
                                                        align="center"
                                                    >
                                                        <Text>Niveau</Text>
                                                        <Badge
                                                            size="lg"
                                                            variant="light"
                                                            color="purple"
                                                        >
                                                            {userStats.level}
                                                        </Badge>
                                                    </Group>
                                                    <Stack gap="xs">
                                                        <Group
                                                            justify="space-between"
                                                            align="center"
                                                        >
                                                            <Text size="sm">
                                                                Progression vers
                                                                le niveau{" "}
                                                                {userStats.level +
                                                                    1}
                                                            </Text>
                                                            <Text
                                                                size="sm"
                                                                fw={500}
                                                            >
                                                                {Math.round(
                                                                    userStats.progress_to_next_level *
                                                                        100
                                                                )}
                                                                %
                                                            </Text>
                                                        </Group>
                                                        <Progress
                                                            value={
                                                                userStats.progress_to_next_level *
                                                                100
                                                            }
                                                            color="violet"
                                                            size="sm"
                                                            radius="xl"
                                                        />
                                                    </Stack>
                                                </>
                                            )}
                                        </Stack>
                                    </Card>

                                    <Card p="md" withBorder>
                                        <Group gap="xs" mb="md">
                                            <IconHash size={20} color="gray" />
                                            <Text fw={600}>Tags préférés</Text>
                                        </Group>
                                        <Stack gap="xs">
                                            <Group gap="xs" wrap="wrap">
                                                {profile?.preferred_tags?.map(
                                                    (tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="light"
                                                            color="gray"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    )
                                                )}
                                            </Group>
                                        </Stack>
                                    </Card>
                                </Stack>

                                {/* Colonne droite - Badges et Projets */}
                                <Stack gap="lg" style={{ flex: 1 }}>
                                    <Card p="md" withBorder>
                                        <Group gap="xs" mb="md">
                                            <IconTrophy
                                                size={20}
                                                color="gold"
                                            />
                                            <Text fw={600}>Badges</Text>
                                        </Group>
                                        <Stack gap="md">
                                            <Group
                                                gap="md"
                                                wrap="wrap"
                                                justify="center"
                                            >
                                                {badges.map((badge) => (
                                                    <Card
                                                        key={badge.id}
                                                        p="md"
                                                        withBorder
                                                        w={120}
                                                        bg={
                                                            badge.unlocked
                                                                ? "white"
                                                                : "gray.1"
                                                        }
                                                        style={{
                                                            opacity:
                                                                badge.unlocked
                                                                    ? 1
                                                                    : 0.5,
                                                        }}
                                                    >
                                                        <Stack
                                                            align="center"
                                                            gap="xs"
                                                        >
                                                            <Box
                                                                style={{
                                                                    color: badge.color,
                                                                }}
                                                            >
                                                                {getBadgeIcon(
                                                                    badge.icon
                                                                )}
                                                            </Box>
                                                            <Text
                                                                size="xs"
                                                                ta="center"
                                                                fw={500}
                                                            >
                                                                {badge.name}
                                                            </Text>
                                                            <Text
                                                                size="xs"
                                                                c="dimmed"
                                                                ta="center"
                                                            >
                                                                {
                                                                    badge.description
                                                                }
                                                            </Text>
                                                            {badge.unlocked &&
                                                                badge.unlocked_at && (
                                                                    <Text
                                                                        size="xs"
                                                                        c="green"
                                                                        ta="center"
                                                                        fw={500}
                                                                    >
                                                                        Débloqué
                                                                        le{" "}
                                                                        {new Date(
                                                                            badge.unlocked_at
                                                                        ).toLocaleDateString(
                                                                            "fr-FR"
                                                                        )}
                                                                    </Text>
                                                                )}
                                                            {!badge.unlocked && (
                                                                <Text
                                                                    size="sm"
                                                                    c="red"
                                                                    ta="center"
                                                                    fw={500}
                                                                >
                                                                    Non débloqué
                                                                </Text>
                                                            )}
                                                        </Stack>
                                                    </Card>
                                                ))}
                        </Group>
                                        </Stack>
                                    </Card>

                                    <Card p="md" withBorder>
                                        <Group gap="xs" mb="md">
                                            <IconBook
                                                size={20}
                                                color="purple"
                                            />
                                            <Text fw={600}>
                                                Projets académiques
                        </Text>
                                        </Group>
                                        <Stack gap="xs">
                                            <Group gap="xs" wrap="wrap">
                                                {profile?.academic_projects?.map(
                                                    (project, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="light"
                                                            color="purple"
                                                            size="lg"
                                                        >
                                                            {project}
                                                        </Badge>
                                                    )
                                                )}
                                            </Group>
                                        </Stack>
                                    </Card>
                                </Stack>
                            </Group>
                        </Stack>

                        {/* Section Posts Populaires */}
                        <Paper p="xl" withBorder radius="lg" mt="xl">
                            <Title order={2} size="h3" mb="lg">
                                <IconStar
                                    size={24}
                                    style={{ marginRight: 8 }}
                                />
                                Posts les plus populaires
                            </Title>

                            <Alert
                                icon={<IconAlertCircle size={16} />}
                                title="Fonctionnalité à venir"
                                                                                    color="violet"
                                variant="light"
                            >
                                Cette section affichera bientôt vos posts les
                                plus populaires basés sur les likes et
                                commentaires. Restez à l'écoute pour les mises à
                                jour !
                            </Alert>
                        </Paper>
                    </Paper>

                    {/* Section Préférences */}
                    <Paper p="xl" withBorder radius="lg">
                        <Title order={2} size="h3" mb="lg">
                            <IconSettings
                                size={24}
                                style={{ marginRight: 8 }}
                            />
                            Préférences
                        </Title>

                        <Grid gutter="xl">
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <IconPalette size={20} />
                                            <Text>Mode sombre</Text>
                                        </Group>
                                        <Switch
                                            checked={darkMode}
                                            onChange={(event) =>
                                                setDarkMode(
                                                    event.currentTarget.checked
                                                )
                                            }
                                        />
                                    </Group>
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <IconWorld size={20} />
                                            <Text>Langue d'affichage</Text>
                                        </Group>
                                        <Select
                                            value={language}
                                            onChange={(value) =>
                                                setLanguage(value || "fr")
                                            }
                                            data={[
                                                {
                                                    value: "fr",
                                                    label: "Français",
                                                },
                                                {
                                                    value: "en",
                                                    label: "English",
                                                },
                                                {
                                                    value: "es",
                                                    label: "Español",
                                                },
                                            ]}
                                            w={120}
                                        />
                                    </Group>
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Card p="md" withBorder>
                                    <Group gap="xs" mb="md">
                                        <IconChartBar size={20} color="violet" />
                                        <Text fw={600}>Progression</Text>
                                    </Group>
                                    <Stack gap="lg">
                                        {userStats ? (
                                            <>
                                                <Stack gap="xs">
                                                    <Group
                                                        justify="space-between"
                                                        align="center"
                                                    >
                                                        <Text size="sm">
                                                            Niveau actuel
                                                        </Text>
                                                        <Badge
                                                            size="lg"
                                                            variant="light"
                                                            color="violet"
                                                        >
                                                            {userStats.level}
                                                        </Badge>
                                                    </Group>
                                                    <Progress
                                                        value={100}
                                                        size="md"
                                                        color="violet"
                                                        radius="xl"
                                                    />
                                                </Stack>

                                                <Stack gap="xs">
                                                    <Group
                                                        justify="space-between"
                                                        align="center"
                                                    >
                                                        <Text size="sm">
                                                            XP vers le niveau{" "}
                                                            {userStats.level +
                                                                1}
                                                        </Text>
                                                        <Text
                                                            size="sm"
                                                            fw={600}
                                                            c="green"
                                                        >
                                                            {Math.round(
                                                                userStats.progress_to_next_level *
                                                                    100
                                                            )}
                                                            %
                                                        </Text>
                                                    </Group>
                                                    <Progress
                                                        value={
                                                            userStats.progress_to_next_level *
                                                            100
                                                        }
                                                        size="md"
                                                        color="green"
                                                        radius="xl"
                                                    />
                                                </Stack>

                                                <Group
                                                    justify="space-between"
                                                    align="center"
                                                    p="xs"
                                                    bg="gray.0"
                                                    style={{ borderRadius: 8 }}
                                                >
                                                    <Text size="sm" fw={500}>
                                                        XP total
                                                    </Text>
                                                    <Badge
                                                        size="lg"
                                    variant="filled"
                                                        color="green"
                                                    >
                                                        {userStats.xp_points}
                                                    </Badge>
                                                </Group>
                                            </>
                                        ) : (
                                            <Alert
                                                icon={
                                                    <IconAlertCircle
                                                        size={16}
                                                    />
                                                }
                                                title="Chargement des statistiques"
                                                color="yellow"
                                                variant="light"
                                            >
                                                Chargement de vos statistiques
                                                de progression...
                                            </Alert>
                                        )}
                                    </Stack>
                                </Card>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Boutons d'action */}
                    {editMode && (
                        <Group justify="center" gap="md">
                            <Button
                                    variant="filled"
                                                                                    color="violet"
                                size="lg"
                                onClick={handleSave}
                                loading={saving}
                                leftSection={<IconCheck size={20} />}
                            >
                                Sauvegarder les modifications
                            </Button>
                            <Button
                                variant="outline"
                                color="gray"
                                size="lg"
                                onClick={() => {
                                    setEditMode(false);
                                    setEditData(profile || {});
                                }}
                                leftSection={<IconX size={20} />}
                            >
                                Annuler
                            </Button>
                        </Group>
                    )}
                </Stack>
            </Container>

            {/* Modal pour changer l'avatar */}
            <Modal
                opened={avatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                title="Changer l'avatar"
                size="md"
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        Choisissez une nouvelle image pour votre avatar
                    </Text>
                    <FileInput
                        accept="image/*"
                        placeholder="Sélectionner une image"
                        leftSection={<IconUpload size={16} />}
                        onChange={handleAvatarUpload}
                    />
                    <Group justify="flex-end">
                        <Button
                            variant="outline"
                            onClick={() => setAvatarModalOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button color="violet">Appliquer</Button>
                    </Group>
                </Stack>
            </Modal>
        </MainLayout>
    );
};

export default ProfilePage;
