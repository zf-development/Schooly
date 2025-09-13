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
    Card,
    Avatar,
    SimpleGrid,
    Box,
} from "@mantine/core";
import {
    IconPlus,
    IconSchool,
} from "@tabler/icons-react";
import subscriptionService from "../services/subscriptionService";

interface DiscoverInstitutionsProps {
    onSubscriptionChange?: () => void;
    userInstitutionId?: string;
    currentSubscriptions?: Subscription[];
    searchTerm?: string;
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
    searchTerm: externalSearchTerm,
}) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
    const [followingLoading, setFollowingLoading] = useState<string | null>(null);
    const [unfollowingLoading, setUnfollowingLoading] = useState<string | null>(null);

    // Charger les données initiales
    useEffect(() => {
        loadData();
    }, []);

    // Synchroniser le terme de recherche externe
    useEffect(() => {
        if (externalSearchTerm !== undefined) {
            setSearchTerm(externalSearchTerm);
        }
    }, [externalSearchTerm]);

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

            {error && (
                <Alert color="red" title="Erreur" mb="md">
                    {error}
                </Alert>
            )}

            {loading ? (
                // Skeletons pour les institutions
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                    {[...Array(8)].map((_, index) => (
                        <Card key={index} withBorder p="md" radius="md">
                            <Stack gap="md" align="center">
                                <Skeleton height={60} circle />
                                <Skeleton height={18} width="80%" />
                                <Skeleton height={14} width="60%" />
                                <Skeleton height={32} width="100%" />
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            ) : filteredInstitutions.length === 0 ? (
                <Alert color="yellow" title="Aucun résultat">
                    Aucun établissement ne correspond à votre recherche.
                </Alert>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                    {filteredInstitutions.map((institution) => {
                        const following = isFollowing(institution.id);
                        const isOwnInstitution = isUserInstitution(institution.id);

                        return (
                            <Card 
                                key={institution.id} 
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
                                        {institution.description && (
                                            <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                                                {institution.description}
                                            </Text>
                                        )}
                                        
                                        <Stack gap="xs" align="center">
                                            {isOwnInstitution && (
                                                <Badge color="green" variant="light" size="sm">
                                                    Mon établissement
                                                </Badge>
                                            )}
                                            {following && !isOwnInstitution && (
                                                <Badge color="violet" variant="light" size="sm">
                                                    Déjà abonné
                                                </Badge>
                                            )}
                                            <Button
                                                variant={following ? "light" : "filled"}
                                                color={following ? "gray" : "violet"}
                                                size="sm"
                                                fullWidth
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
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>
                        );
                    })}
                </SimpleGrid>
            )}
        </Stack>
    );
};

export default DiscoverInstitutions;
