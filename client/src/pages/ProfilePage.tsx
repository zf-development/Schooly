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
} from "@mantine/core";
import {
    IconAlertCircle,
    IconCheck,
    IconX,
    IconUser,
    IconEdit,
    IconCamera,
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
    avatar_url: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useUserContext();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await userService.getMe();

            if (response.success && response.data) {
                setProfile(response.data);
                setDisplayName(response.data.display_name);
                setAvatarUrl(response.data.avatar_url);

                // Mettre à jour le contexte utilisateur avec les données chargées
                setUser({
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.display_name || "Utilisateur",
                    avatar_url: response.data.avatar_url,
                });
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

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updateData: { display_name?: string; avatar_url?: string } =
                {};

            if (displayName !== profile?.display_name) {
                updateData.display_name = displayName;
            }

            if (avatarUrl !== profile?.avatar_url) {
                updateData.avatar_url = avatarUrl;
            }

            if (Object.keys(updateData).length === 0) {
                setSuccess("Aucune modification à sauvegarder");
                setSaving(false);
                return;
            }

            const response = await userService.updateMe(updateData);

            if (response.success && response.data) {
                setProfile(response.data);
                setSuccess("Profil mis à jour avec succès !");

                setUser({
                    id: user?.id || "",
                    email: user?.email || "",
                    name:
                        response.data.display_name ||
                        user?.name ||
                        "Utilisateur",
                    avatar_url: response.data.avatar_url || user?.avatar_url,
                });

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

    const { user, setUser } = useUserContext();
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
                <Container size="md" py="xl">
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
            <Container size="md" py="xl">
                <Stack gap="xl">
                    <Title order={1} ta="center" c="academic">
                        Mon Profil
                    </Title>

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

                    <Paper p="xl" withBorder radius="md">
                        <Stack gap="xl">
                            <Card p="lg" withBorder radius="md" bg="gray.0">
                                <Stack gap="lg" align="center">
                                    <Group style={{ position: "relative" }}>
                                        <Avatar
                                            src={avatarUrl}
                                            size="xl"
                                            radius="xl"
                                            alt="Avatar de l'utilisateur"
                                        />
                                    </Group>

                                    <Stack gap="xs" align="center">
                                        <Title order={2} c="academic">
                                            {profile?.display_name ||
                                                "Utilisateur"}
                                        </Title>
                                        <Text size="sm" c="dimmed">
                                            Membre de la communauté
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Card>

                            <Divider />

                            {/* Section Édition du profil */}
                            <Stack gap="lg">
                                <Group>
                                    <IconEdit
                                        size={20}
                                        color="var(--mantine-color-academic)"
                                    />
                                    <Title order={3}>Modifier mon profil</Title>
                                </Group>

                                <TextInput
                                    label="Email"
                                    value={profile?.email || ""}
                                    disabled
                                    description="L'email ne peut pas être modifié"
                                    variant="filled"
                                />

                                <TextInput
                                    label="Nom d'affichage"
                                    placeholder="Votre nom d'affichage..."
                                    value={displayName}
                                    onChange={(e) =>
                                        setDisplayName(e.currentTarget.value)
                                    }
                                    required
                                    variant="filled"
                                />

                                <TextInput
                                    label="URL de l'avatar"
                                    placeholder="https://exemple.com/avatar.jpg"
                                    value={avatarUrl}
                                    onChange={(e) =>
                                        setAvatarUrl(e.currentTarget.value)
                                    }
                                    description="Laissez vide pour utiliser l'avatar par défaut"
                                    variant="filled"
                                />

                                {saving ? (
                                    <Skeleton height={42} width="100%" />
                                ) : (
                                    <Button
                                        onClick={handleSave}
                                        disabled={!displayName.trim()}
                                        fullWidth
                                        size="md"
                                        leftSection={<IconCheck size={16} />}
                                    >
                                        Enregistrer les modifications
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </MainLayout>
    );
};

export default ProfilePage;
