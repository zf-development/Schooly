import React, { useState, useEffect } from "react";
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
    Flex,
} from "@mantine/core";
import {
    IconSchool,
    IconBuilding,
    IconCertificate,
    IconUsers,
    IconMapPin,
} from "@tabler/icons-react";
import subscriptionService from "../services/subscriptionService";

interface DiscoverInstitutionsProps {
    onSubscriptionChange?: () => void;
    userInstitutionId?: string;
    currentSubscriptions?: Subscription[];
    searchTerm?: string;
    sortBy?: string;
    filterTypes?: string[];
    viewMode?: 'grid' | 'list';
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
    sortBy: externalSortBy,
    filterTypes: externalFilterTypes,
    viewMode = 'grid',
}) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
    const [followingLoading, setFollowingLoading] = useState<string | null>(null);
    const [unfollowingLoading, setUnfollowingLoading] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>(externalSortBy || 'name');
    const [filterTypes, setFilterTypes] = useState<string[]>(externalFilterTypes || []);

    // Charger les données initiales
    useEffect(() => {
        loadData();
    }, []);

    // Synchroniser les props externes
    useEffect(() => {
        if (externalSearchTerm !== undefined) {
            setSearchTerm(externalSearchTerm);
        }
    }, [externalSearchTerm]);

    useEffect(() => {
        if (externalSortBy !== undefined) {
            setSortBy(externalSortBy);
        }
    }, [externalSortBy]);

    useEffect(() => {
        if (externalFilterTypes !== undefined) {
            setFilterTypes(externalFilterTypes);
        }
    }, [externalFilterTypes]);

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
        return currentSubscriptions
            ? currentSubscriptions.some((sub) => sub.institution_id === institutionId)
            : false;
    };

    const isUserInstitution = (institutionId: string): boolean => {
        return institutionId === userInstitutionId;
    };

    // Fonction pour déterminer le type d'institution et l'icône
    const getInstitutionType = (name: string, description: string) => {
        const nameLower = name.toLowerCase();
        const descLower = description.toLowerCase();

        if (nameLower.includes('université') || nameLower.includes('university') || descLower.includes('université')) {
            return { type: 'Université', icon: IconCertificate, color: 'blue' };
        }
        if (nameLower.includes('cégep') || nameLower.includes('collège') || nameLower.includes('college') || descLower.includes('collégial')) {
            return { type: 'CÉGEP/Collège', icon: IconBuilding, color: 'green' };
        }
        if (nameLower.includes('école primaire') || nameLower.includes('école secondaire') || descLower.includes('centre de services')) {
            return { type: 'École', icon: IconSchool, color: 'orange' };
        }
        if (nameLower.includes('centre de formation') || descLower.includes('formation professionnelle')) {
            return { type: 'Formation', icon: IconUsers, color: 'violet' };
        }
        if (descLower.includes('privé')) {
            return { type: 'Privé', icon: IconBuilding, color: 'grape' };
        }

        return { type: 'Établissement', icon: IconSchool, color: 'gray' };
    };

    // Fonction pour extraire la ville de la description
    const getCityFromDescription = (description: string) => {
        const parts = description.split(', ');
        return parts.length > 1 ? parts[1] : '';
    };

    // Options de triage
    const sortOptions = [
        { value: 'name', label: 'Nom (A-Z)' },
        { value: 'name-desc', label: 'Nom (Z-A)' },
        { value: 'type', label: 'Type d\'institution' },
        { value: 'city', label: 'Ville' },
    ];

    // Options de filtrage par type
    const typeOptions = [
        { value: 'Université', label: 'Universités' },
        { value: 'CÉGEP/Collège', label: 'CÉGEPs/Collèges' },
        { value: 'École', label: 'Écoles' },
        { value: 'Formation', label: 'Formation professionnelle' },
        { value: 'Privé', label: 'Établissements privés' },
    ];

    // Fonction de triage
    const sortInstitutions = (institutions: Institution[]) => {
        return [...institutions].sort((a, b) => {
            const aType = getInstitutionType(a.name, a.description || '');
            const bType = getInstitutionType(b.name, b.description || '');
            const aCity = getCityFromDescription(a.description || '');
            const bCity = getCityFromDescription(b.description || '');

            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'type':
                    return aType.type.localeCompare(bType.type);
                case 'city':
                    return aCity.localeCompare(bCity);
                default:
                    return 0;
            }
        });
    };

    const filteredInstitutions = Array.isArray(allInstitutions)
        ? sortInstitutions(
            allInstitutions.filter(
                (institution) => {
                    const institutionType = getInstitutionType(institution.name, institution.description || '');

                    return (
                        institution.id !== userInstitutionId &&
                        !isFollowing(institution.id) &&
                        institution.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) &&
                        (filterTypes.length === 0 || filterTypes.includes(institutionType.type))
                    );
                }
            )
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
                viewMode === 'grid' ? (
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
                ) : (
                    <Stack gap="md">
                        {[...Array(8)].map((_, index) => (
                            <Card key={index} withBorder p="md" radius="md">
                                <Group justify="space-between" align="center">
                                    <Group gap="md">
                                        <Skeleton height={40} circle />
                                        <Box>
                                            <Skeleton height={18} width="200px" mb="xs" />
                                            <Skeleton height={14} width="150px" />
                                        </Box>
                                    </Group>
                                    <Skeleton height={32} width={100} />
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                )
            ) : filteredInstitutions.length === 0 ? (
                <Alert color="yellow" title="Aucun résultat">
                    Aucun établissement ne correspond à votre recherche.
                </Alert>
            ) : viewMode === 'grid' ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                    {filteredInstitutions.map((institution) => {
                        const institutionType = getInstitutionType(institution.name, institution.description || '');
                        const city = getCityFromDescription(institution.description || '');
                        const IconComponent = institutionType.icon;

                        return (
                            <Card
                                key={institution.id}
                                withBorder
                                p="lg"
                                radius="md"
                                style={{
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    height: '100%'
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
                                <Stack gap="md" h="100%">
                                    {/* En-tête avec logo et badge de type */}
                                    <Flex justify="space-between" align="flex-start">
                                        <Avatar
                                            src={institution.logoUrl}
                                            size="lg"
                                            color={institutionType.color}
                                            radius="md"
                                        >
                                            <IconComponent size={20} />
                                        </Avatar>
                                        <Badge
                                            color={institutionType.color}
                                            variant="light"
                                            size="sm"
                                            radius="md"
                                        >
                                            {institutionType.type}
                                        </Badge>
                                    </Flex>

                                    {/* Nom de l'institution */}
                                    <Box>
                                        <Text fw={700} size="md" mb="xs" lineClamp={2}>
                                            {institution.name}
                                        </Text>

                                        {/* Ville et informations */}
                                        {city && (
                                            <Group gap="xs" mb="sm">
                                                <IconMapPin size={14} color="var(--mantine-color-gray-6)" />
                                                <Text size="sm" c="dimmed">
                                                    {city}
                                                </Text>
                                            </Group>
                                        )}

                                        {/* Description courte */}
                                        {institution.description && (
                                            <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                                                {institution.description.split(',')[0]}
                                            </Text>
                                        )}
                                    </Box>

                                    {/* Bouton d'action en bas */}
                                    <Box mt="auto">
                                        <Button
                                            variant="filled"
                                            color="violet"
                                            size="sm"
                                            fullWidth
                                            loading={followingLoading === institution.id}
                                            onClick={() => handleFollow(institution.id)}
                                        >
                                            S'abonner
                                        </Button>
                                    </Box>
                                </Stack>
                            </Card>
                        );
                    })}
                </SimpleGrid>
            ) : (
                // Vue liste
                <Stack gap="md">
                    {filteredInstitutions.map((institution) => {
                        const institutionType = getInstitutionType(institution.name, institution.description || '');
                        const city = getCityFromDescription(institution.description || '');
                        const IconComponent = institutionType.icon;

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
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Group justify="space-between" align="center">
                                    <Group gap="md">
                                        <Avatar
                                            src={institution.logoUrl}
                                            size="md"
                                            color={institutionType.color}
                                            radius="md"
                                        >
                                            <IconComponent size={18} />
                                        </Avatar>
                                        <Box>
                                            <Group gap="sm" mb="xs">
                                                <Text fw={600} size="md">
                                                    {institution.name}
                                                </Text>
                                                <Badge
                                                    color={institutionType.color}
                                                    variant="light"
                                                    size="sm"
                                                    radius="md"
                                                >
                                                    {institutionType.type}
                                                </Badge>
                                            </Group>

                                            {city && (
                                                <Group gap="xs" mb="xs">
                                                    <IconMapPin size={12} color="var(--mantine-color-gray-6)" />
                                                    <Text size="sm" c="dimmed">
                                                        {city}
                                                    </Text>
                                                </Group>
                                            )}

                                            {institution.description && (
                                                <Text size="sm" c="dimmed" lineClamp={1}>
                                                    {institution.description.split(',')[0]}
                                                </Text>
                                            )}
                                        </Box>
                                    </Group>

                                    <Button
                                        variant="filled"
                                        color="violet"
                                        size="sm"
                                        loading={followingLoading === institution.id}
                                        onClick={() => handleFollow(institution.id)}
                                    >
                                        S'abonner
                                    </Button>
                                </Group>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
};

export default DiscoverInstitutions;
