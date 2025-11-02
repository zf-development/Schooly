import React, { useState, useEffect, useCallback } from "react";
import {
    Text,
    Stack,
    Group,
    Badge,
    Button,
    Alert,
    Skeleton,
    Card,
    Avatar,
    SimpleGrid,
    Box,
} from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import subscriptionService from "../services/subscriptionService";

interface SubscriptionsListProps {
    onSubscriptionChange?: () => void;
    userInstitutionId?: string;
    userInstitutionName?: string;
    subscriptions?: Subscription[];
    loading?: boolean;
    error?: string | null;
}

interface Institution {
    id: string;
    name: string;
    logoUrl?: string;
    description?: string;
}

interface Subscription {
    id: string;
    follower_user_id: string;
    institution_id: string;
    created_at: string;
    institution?: Institution;
}

const SubscriptionsList: React.FC<SubscriptionsListProps> = ({
    onSubscriptionChange,
    userInstitutionId,
    userInstitutionName,
    subscriptions: propSubscriptions,
    loading: propLoading,
    error: propError,
}) => {
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unfollowingLoading, setUnfollowingLoading] = useState<string | null>(null);
    const [followingLoading, setFollowingLoading] = useState<string | null>(null);

    // Utiliser les props si disponibles, sinon les états locaux
    const subscriptions = propSubscriptions || [];
    const loadingState = propLoading !== undefined ? propLoading : loading;

    const errorState = propError !== undefined ? propError : error;

    const loadInstitutions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const institutionsResponse = await fetch("http://localhost:3001/api/institutions", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("authToken"),
                },
            }).then((r) => r.json());

            if (institutionsResponse.success && institutionsResponse.data) {
                const institutions = Array.isArray(institutionsResponse.data)
                    ? institutionsResponse.data
                    : [];
                setAllInstitutions(institutions);
            } else {
                setAllInstitutions([]);
            }

            if (!institutionsResponse.success) {
                setError(
                    institutionsResponse.error ||
                    "Erreur lors du chargement des établissements"
                );
            }
        } catch (err) {
            console.error("Erreur dans loadInstitutions:", err);
            setError("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    }, []);

    // Recharger les institutions une fois si l'institution de l'utilisateur n'est pas trouvée après le premier chargement
    const [hasCheckedInstitution, setHasCheckedInstitution] = useState(false);
    
    // Réinitialiser le flag quand l'institution de l'utilisateur change
    useEffect(() => {
        setHasCheckedInstitution(false);
    }, [userInstitutionId]);
    
    useEffect(() => {
        if (userInstitutionId && allInstitutions.length > 0 && !hasCheckedInstitution) {
            const userInstitution = allInstitutions.find(inst => inst.id === userInstitutionId);
            if (!userInstitution) {
                // L'institution de l'utilisateur n'est pas dans la liste, recharger une fois
                console.log(`Institution de l'utilisateur ${userInstitutionId} non trouvée, rechargement...`);
                loadInstitutions();
            }
            setHasCheckedInstitution(true);
        }
    }, [userInstitutionId, allInstitutions, hasCheckedInstitution, loadInstitutions]);

    // Charger seulement les établissements si les abonnements sont fournis en props
    useEffect(() => {
        if (!propSubscriptions) {
            loadData();
        } else {
            loadInstitutions();
        }
    }, [propSubscriptions, loadInstitutions]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Charger les abonnements et les établissements en parallèle
            const [subscriptionsResponse, institutionsResponse] = await Promise.all([
                subscriptionService.list(),
                fetch("http://localhost:3001/api/institutions", {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("authToken"),
                    },
                }).then((r) => r.json()),
            ]);

            // Gérer les deux structures possibles de l'API
            let subscriptionsData = [];
            if (subscriptionsResponse.success && subscriptionsResponse.data) {
                if (Array.isArray(subscriptionsResponse.data)) {
                    subscriptionsData = subscriptionsResponse.data;
                } else if ((subscriptionsResponse.data as any).subscriptions) {
                    subscriptionsData = Array.isArray((subscriptionsResponse.data as any).subscriptions)
                        ? (subscriptionsResponse.data as any).subscriptions
                        : [];
                }
            } else if ((subscriptionsResponse as any).subscriptions) {
                subscriptionsData = Array.isArray((subscriptionsResponse as any).subscriptions)
                    ? (subscriptionsResponse as any).subscriptions
                    : [];
            }

            if (institutionsResponse.success && institutionsResponse.data) {
                const institutions = Array.isArray(institutionsResponse.data)
                    ? institutionsResponse.data
                    : [];
                setAllInstitutions(institutions);
            } else {
                setAllInstitutions([]);
            }

            if (!subscriptionsResponse.success) {
                setError(
                    subscriptionsResponse.error ||
                    "Erreur lors du chargement des abonnements"
                );
            }

            if (!institutionsResponse.success) {
                setError(
                    institutionsResponse.error ||
                    "Erreur lors du chargement des établissements"
                );
            }
        } catch (err) {
            console.error("Erreur dans loadData:", err);
            setError("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (institutionId: string) => {
        try {
            setFollowingLoading(institutionId);
            const response = await subscriptionService.follow(institutionId);

            if (response.success) {
                // Recharger les abonnements
                await loadData();
                onSubscriptionChange?.();
            } else {
                setError(response.error || "Erreur lors de l'abonnement");
            }
        } catch (err) {
            setError("Erreur lors de l'abonnement");
        } finally {
            setFollowingLoading(null);
        }
    };

    const handleUnfollow = async (institutionId: string) => {
        // Empêcher de se désabonner de son propre établissement
        if (institutionId === userInstitutionId) {
            return;
        }

        try {
            setUnfollowingLoading(institutionId);
            const response = await subscriptionService.unfollow(institutionId);

            if (response.success) {
                // Notifier le parent pour recharger les données
                onSubscriptionChange?.();
            } else {
                setError(response.error || "Erreur lors du désabonnement");
            }
        } catch (err) {
            setError("Erreur lors du désabonnement");
        } finally {
            setUnfollowingLoading(null);
        }
    };

    const isFollowing = (institutionId: string): boolean => {
        return subscriptions
            ? subscriptions.some((sub) => sub.institution_id === institutionId)
            : false;
    };

    const isUserInstitution = (institutionId: string): boolean => {
        return institutionId === userInstitutionId;
    };



    // Ce composant affiche seulement les abonnements actuels, pas la recherche

    if (loading) {
        return (
            <Stack gap="md">
                <Skeleton height={30} width="40%" />
                <Skeleton height={20} width="60%" />
                <Skeleton height={100} />
                <Skeleton height={100} />
            </Stack>
        );
    }

    return (
        <Stack gap="lg">
            {/* Section des abonnements actuels */}
            <div>

                {loadingState ? (
                    <Stack gap="sm">
                        {[...Array(3)].map((_, index) => (
                            <Card key={index} withBorder p="sm">
                                <Group justify="space-between">
                                    <Group gap="sm">
                                        <Skeleton height={40} circle />
                                        <div style={{ flex: 1 }}>
                                            <Skeleton
                                                height={18}
                                                width="60%"
                                                mb={4}
                                            />
                                            <Skeleton
                                                height={14}
                                                width="40%"
                                            />
                                        </div>
                                    </Group>
                                    <Skeleton height={32} width={100} />
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                ) : !subscriptions || subscriptions.length === 0 ? (
                    <Alert color="violet" title="Aucun abonnement">
                        Vous n'êtes abonné à aucun établissement pour le
                        moment.
                    </Alert>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                        {/* Afficher l'établissement de l'utilisateur */}
                        {userInstitutionId && (
                            <Card
                                withBorder
                                p="md"
                                radius="md"
                                style={{
                                    backgroundColor: 'var(--mantine-color-green-0)',
                                    borderColor: 'var(--mantine-color-green-3)'
                                }}
                            >
                                <Stack gap="md" align="center">
                                    <Avatar
                                        src={
                                            allInstitutions.find(inst => inst.id === userInstitutionId)?.logoUrl || 
                                            undefined
                                        }
                                        size="xl"
                                        color="green"
                                        radius="md"
                                    >
                                        <IconSchool size={24} />
                                    </Avatar>
                                    <Box ta="center">
                                        <Text fw={600} size="md" mb="xs">
                                            {userInstitutionName || 
                                             allInstitutions.find(inst => inst.id === userInstitutionId)?.name || 
                                             "Mon établissement"}
                                        </Text>
                                        <Badge
                                            color="green"
                                            variant="light"
                                            size="sm"
                                        >
                                            Établissement principal
                                        </Badge>
                                    </Box>
                                </Stack>
                            </Card>
                        )}

                        {subscriptions
                            .filter((subscription) => subscription.institution_id !== userInstitutionId)
                            .map((subscription) => {
                                const institution = allInstitutions
                                    ? allInstitutions.find(
                                        (inst) =>
                                            inst.id ===
                                            subscription.institution_id
                                    )
                                    : null;
                                if (!institution) return null;

                                return (
                                    <Card
                                        key={subscription.id}
                                        withBorder
                                        p="md"
                                        radius="md"
                                        style={{
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <Stack gap="md" align="center">
                                            <Avatar
                                                src={institution.logoUrl}
                                                size="xl"
                                                color="violet"
                                                radius="md"
                                            >
                                                <IconSchool size={24} />
                                            </Avatar>
                                            <Box ta="center">
                                                <Text fw={600} size="md" mb="xs">
                                                    {institution.name}
                                                </Text>
                                                <Text size="sm" c="dimmed" mb="md">
                                                    Abonné depuis{" "}
                                                    {new Date(
                                                        subscription.created_at
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )}
                                                </Text>
                                                <Button
                                                    variant="light"
                                                    color="red"
                                                    size="sm"
                                                    fullWidth
                                                    loading={
                                                        unfollowingLoading ===
                                                        institution.id
                                                    }
                                                    onClick={() =>
                                                        handleUnfollow(
                                                            institution.id
                                                        )
                                                    }
                                                >
                                                    Se désabonner
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </Card>
                                );
                            })}
                    </SimpleGrid>
                )}
            </div>

        </Stack>
    );
};

export default SubscriptionsList;
