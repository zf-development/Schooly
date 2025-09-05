import React, { useState, useEffect } from "react";
import {
    Paper,
    Title,
    Text,
    Stack,
    Group,
    Badge,
    Button,
    Alert,
    Skeleton,
    Divider,
    TextInput,
    Card,
    Avatar,
    ActionIcon,
} from "@mantine/core";
import {
    IconSearch,
    IconPlus,
    IconX,
    IconSchool,
} from "@tabler/icons-react";
import subscriptionService from "../services/subscriptionService";

interface DiscoverInstitutionsProps {
    onSubscriptionChange?: () => void;
    userInstitutionId?: string;
    currentSubscriptions?: Subscription[];
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

const DiscoverInstitutions: React.FC<DiscoverInstitutionsProps> = ({
    onSubscriptionChange,
    userInstitutionId,
    currentSubscriptions,
}) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [followingLoading, setFollowingLoading] = useState<string | null>(null);
    const [unfollowingLoading, setUnfollowingLoading] = useState<string | null>(null);

    // Charger les données initiales
    useEffect(() => {
        loadData();
    }, []);

    // Synchroniser avec les abonnements actuels
    useEffect(() => {
        if (currentSubscriptions) {
            setSubscriptions(currentSubscriptions);
        }
    }, [currentSubscriptions]);

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
            let subscriptions = [];
            if (subscriptionsResponse.success && subscriptionsResponse.data) {
                if (Array.isArray(subscriptionsResponse.data)) {
                    subscriptions = subscriptionsResponse.data;
                } else if ((subscriptionsResponse.data as any).subscriptions) {
                    subscriptions = Array.isArray((subscriptionsResponse.data as any).subscriptions)
                        ? (subscriptionsResponse.data as any).subscriptions
                        : [];
                }
            } else if ((subscriptionsResponse as any).subscriptions) {
                subscriptions = Array.isArray((subscriptionsResponse as any).subscriptions)
                    ? (subscriptionsResponse as any).subscriptions
                    : [];
            }

            setSubscriptions(subscriptions);

            if (institutionsResponse.success && institutionsResponse.data) {
                const institutions = Array.isArray(institutionsResponse.data)
                    ? institutionsResponse.data
                    : [];
                setAllInstitutions(institutions);
            } else {
                setAllInstitutions([]);
            }

            if (!subscriptionsResponse.success) {
                setError(subscriptionsResponse.error || "Erreur lors du chargement des abonnements");
            }

            if (!institutionsResponse.success) {
                setError(institutionsResponse.error || "Erreur lors du chargement des établissements");
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
        if (institutionId === userInstitutionId) {
            return;
        }

        try {
            setUnfollowingLoading(institutionId);
            const response = await subscriptionService.unfollow(institutionId);

            if (response.success) {
                await loadData();
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

    const filteredInstitutions = Array.isArray(allInstitutions)
        ? allInstitutions.filter(
              (institution) =>
                  institution.id !== userInstitutionId &&
                  institution.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <Stack gap="md">
            <TextInput
                placeholder="Rechercher un établissement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                rightSection={
                    searchTerm && (
                        <ActionIcon
                            variant="subtle"
                            onClick={() => setSearchTerm("")}
                            size="sm"
                        >
                            <IconX size={16} />
                        </ActionIcon>
                    )
                }
                mb="md"
            />

            {error && (
                <Alert color="red" title="Erreur" mb="md">
                    {error}
                </Alert>
            )}

            <Stack gap="sm">
                {loading ? (
                    // Skeletons pour les institutions
                    [...Array(4)].map((_, index) => (
                        <Card key={index} withBorder p="sm">
                            <Group justify="space-between">
                                <Group gap="sm">
                                    <Skeleton height={40} circle />
                                    <div style={{ flex: 1 }}>
                                        <Skeleton height={18} width="70%" mb={4} />
                                        <Skeleton height={14} width="50%" />
                                    </div>
                                </Group>
                                <Group gap="xs">
                                    <Skeleton height={24} width={80} />
                                    <Skeleton height={32} width={90} />
                                </Group>
                            </Group>
                        </Card>
                    ))
                ) : filteredInstitutions.length === 0 ? (
                    <Alert color="yellow" title="Aucun résultat">
                        Aucun établissement ne correspond à votre recherche.
                    </Alert>
                ) : (
                    filteredInstitutions.map((institution) => {
                        const following = isFollowing(institution.id);
                        const isOwnInstitution = isUserInstitution(institution.id);

                        return (
                            <Card key={institution.id} withBorder p="sm">
                                <Group justify="space-between">
                                    <Group gap="sm">
                                        <Avatar
                                            src={institution.logoUrl}
                                            size="md"
                                            color="violet"
                                        >
                                            <IconSchool size={16} />
                                        </Avatar>
                                        <div>
                                            <Text fw={500}>{institution.name}</Text>
                                            {institution.description && (
                                                <Text size="sm" c="dimmed" lineClamp={2}>
                                                    {institution.description}
                                                </Text>
                                            )}
                                        </div>
                                    </Group>

                                    <Group gap="xs">
                                        {isOwnInstitution && (
                                            <Badge color="green" variant="light">
                                                Mon établissement
                                            </Badge>
                                        )}
                                        {following && !isOwnInstitution && (
                                            <Badge color="violet" variant="light">
                                                Déjà abonné
                                            </Badge>
                                        )}
                                        <Button
                                            variant={following ? "light" : "filled"}
                                            color={following ? "gray" : "violet"}
                                            size="sm"
                                            disabled={isOwnInstitution || following}
                                            loading={followingLoading === institution.id}
                                            onClick={() =>
                                                following
                                                    ? handleUnfollow(institution.id)
                                                    : handleFollow(institution.id)
                                            }
                                        >
                                            {following ? "Se désabonner" : "S'abonner"}
                                        </Button>
                                    </Group>
                                </Group>
                            </Card>
                        );
                    })
                )}
            </Stack>
        </Stack>
    );
};

export default DiscoverInstitutions;
