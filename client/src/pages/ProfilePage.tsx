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
    Avatar,
    Group,
    Divider,
    Tabs,
    Skeleton,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconCheck,
    IconX,
    IconUser,
    IconBuilding,
} from "@tabler/icons-react";
import MainLayout from "../layouts/MainLayout";
import type { AuthButtonProps } from "../types";
import userService from "../services/userService";
import SubscriptionsList from "../components/SubscriptionsList";
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

    // Champs éditables
    const [displayName, setDisplayName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Plus besoin de données de démonstration pour les institutions

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

                // Mettre à jour le contexte utilisateur avec les nouvelles données
                setUser({
                    id: user?.id || "",
                    email: user?.email || "",
                    name:
                        response.data.display_name ||
                        user?.name ||
                        "Utilisateur",
                    avatar_url: response.data.avatar_url || user?.avatar_url,
                });

                // Recharger le profil pour avoir les données à jour
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

    // Plus besoin de gérer le changement d'institution

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
                    <Stack gap="xl" align="center">
                        <Title order={1} ta="center" c="academic">
                            Chargement du profil...
                        </Title>
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

                    <Paper p="xl" withBorder>
                        <Tabs defaultValue="profile">
                            <Tabs.List>
                                <Tabs.Tab
                                    value="profile"
                                    leftSection={<IconUser size={16} />}
                                >
                                    Mon Profil
                                </Tabs.Tab>
                                <Tabs.Tab
                                    value="subscriptions"
                                    leftSection={<IconBuilding size={16} />}
                                >
                                    Mes Abonnements
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="profile" pt="md">
                                <Stack gap="lg">
                                    <Group justify="center">
                                        <Avatar
                                            src={avatarUrl}
                                            size="xl"
                                            radius="xl"
                                            alt="Avatar de l'utilisateur"
                                        />
                                    </Group>

                                    <Divider />

                                    <TextInput
                                        label="Email"
                                        value={profile?.email || ""}
                                        disabled
                                        description="L'email ne peut pas être modifié"
                                    />

                                    <TextInput
                                        label="Nom d'affichage"
                                        placeholder="Votre nom d'affichage..."
                                        value={displayName}
                                        onChange={(e) =>
                                            setDisplayName(
                                                e.currentTarget.value
                                            )
                                        }
                                        required
                                    />

                                    <TextInput
                                        label="URL de l'avatar"
                                        placeholder="https://exemple.com/avatar.jpg"
                                        value={avatarUrl}
                                        onChange={(e) =>
                                            setAvatarUrl(e.currentTarget.value)
                                        }
                                        description="Laissez vide pour utiliser l'avatar par défaut"
                                    />

                                    {saving ? (
                                        <Skeleton height={42} width="100%" />
                                    ) : (
                                        <Button
                                            onClick={handleSave}
                                            disabled={!displayName.trim()}
                                            fullWidth
                                        >
                                            Enregistrer les modifications
                                        </Button>
                                    )}
                                </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="subscriptions" pt="md">
                                <SubscriptionsList
                                    onSubscriptionChange={() => {
                                        // Optionnel : recharger le profil si nécessaire
                                    }}
                                    userInstitutionId={profile?.institution_id}
                                />
                            </Tabs.Panel>
                        </Tabs>
                    </Paper>
                </Stack>
            </Container>
        </MainLayout>
    );
};

export default ProfilePage;
