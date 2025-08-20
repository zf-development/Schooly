import React, { useState, useEffect } from 'react';
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
    ActionIcon
} from '@mantine/core';
import { IconSearch, IconPlus, IconX, IconSchool, IconUserCheck } from '@tabler/icons-react';
import subscriptionService from '../services/subscriptionService';
import institutionService from '../services/institutionService';

interface SubscriptionsListProps {
    onSubscriptionChange?: () => void;
    userInstitutionId?: string;
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
    userInstitutionId
}) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [followingLoading, setFollowingLoading] = useState<string | null>(null);
    const [unfollowingLoading, setUnfollowingLoading] = useState<string | null>(null);

    // Charger les données initiales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Début du chargement des données...');

            // Charger les abonnements et les établissements en parallèle
            const [subscriptionsResponse, institutionsResponse] = await Promise.all([
                subscriptionService.list(),
                // Appel direct à l'API pour diagnostiquer
                fetch('http://localhost:3001/api/institutions', {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                    }
                }).then(r => r.json())
            ]);

            console.log('📡 Réponse abonnements:', subscriptionsResponse);
            console.log('📡 Réponse établissements:', institutionsResponse);

            // Gérer les deux structures possibles de l'API
            let subscriptions = [];
            if (subscriptionsResponse.success && subscriptionsResponse.data) {
                if (Array.isArray(subscriptionsResponse.data)) {
                    // Structure : { success: true, data: [...] }
                    subscriptions = subscriptionsResponse.data;
                } else if ((subscriptionsResponse.data as any).subscriptions) {
                    // Structure : { success: true, data: { subscriptions: [...], total: X } }
                    subscriptions = Array.isArray((subscriptionsResponse.data as any).subscriptions) ? (subscriptionsResponse.data as any).subscriptions : [];
                }
            } else if ((subscriptionsResponse as any).subscriptions) {
                // Structure alternative : { subscriptions: [...], total: X }
                subscriptions = Array.isArray((subscriptionsResponse as any).subscriptions) ? (subscriptionsResponse as any).subscriptions : [];
            }

            console.log('✅ Abonnements chargés:', subscriptions);
            console.log('📊 Détail des abonnements:', subscriptions);
            console.log('🔍 Structure de la réponse:', subscriptionsResponse);
            console.log('🔍 Clés de la réponse:', Object.keys(subscriptionsResponse));
            console.log('🔍 Contenu de subscriptions:', subscriptions);
            setSubscriptions(subscriptions);

            if (institutionsResponse.success && institutionsResponse.data) {
                // S'assurer que data est un tableau
                const institutions = Array.isArray(institutionsResponse.data) ? institutionsResponse.data : [];
                console.log('✅ Établissements chargés:', institutions);
                setAllInstitutions(institutions);
            } else {
                // En cas d'échec, initialiser avec un tableau vide
                console.log('❌ Échec chargement établissements');
                setAllInstitutions([]);
            }

            if (!subscriptionsResponse.success) {
                setError(subscriptionsResponse.error || 'Erreur lors du chargement des abonnements');
            }

            if (!institutionsResponse.success) {
                setError(institutionsResponse.error || 'Erreur lors du chargement des établissements');
            }
        } catch (err) {
            console.error('💥 Erreur dans loadData:', err);
            setError('Erreur lors du chargement des données');
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
                setError(response.error || 'Erreur lors de l\'abonnement');
            }
        } catch (err) {
            setError('Erreur lors de l\'abonnement');
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
                // Recharger les abonnements
                await loadData();
                onSubscriptionChange?.();
            } else {
                setError(response.error || 'Erreur lors du désabonnement');
            }
        } catch (err) {
            setError('Erreur lors du désabonnement');
        } finally {
            setUnfollowingLoading(null);
        }
    };

    const isFollowing = (institutionId: string): boolean => {
        return subscriptions ? subscriptions.some(sub => sub.institution_id === institutionId) : false;
    };

    const isUserInstitution = (institutionId: string): boolean => {
        return institutionId === userInstitutionId;
    };

    // Debug: vérifier le type de allInstitutions et subscriptions
    console.log('allInstitutions type:', typeof allInstitutions, 'value:', allInstitutions);
    console.log('subscriptions type:', typeof subscriptions, 'value:', subscriptions);

    const filteredInstitutions = Array.isArray(allInstitutions) ? allInstitutions.filter(institution =>
        // Exclure l'établissement de l'utilisateur et filtrer par nom
        institution.id !== userInstitutionId &&
        institution.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) {
        return (
            <Paper p="md" withBorder>
                <Stack gap="md">
                    <Skeleton height={30} width="40%" />
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={100} />
                    <Skeleton height={100} />
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper p="md" withBorder>
            <Stack gap="lg">
                {/* Section des abonnements actuels */}
                <div>
                    <Title order={3} mb="md">
                        <IconUserCheck size={20} style={{ marginRight: 8 }} />
                        Mes Abonnements ({subscriptions ? subscriptions.length : 0})
                    </Title>

                    {!subscriptions || subscriptions.length === 0 ? (
                        <Alert color="blue" title="Aucun abonnement">
                            Vous n'êtes abonné à aucun établissement pour le moment.
                        </Alert>
                    ) : (
                        <Stack gap="sm">
                            {subscriptions.map((subscription) => {
                                const institution = allInstitutions ? allInstitutions.find(inst => inst.id === subscription.institution_id) : null;
                                if (!institution) return null;

                                return (
                                    <Card key={subscription.id} withBorder p="sm">
                                        <Group justify="space-between">
                                            <Group gap="sm">
                                                <Avatar
                                                    src={institution.logoUrl}
                                                    size="md"
                                                    color="blue"
                                                >
                                                    <IconSchool size={16} />
                                                </Avatar>
                                                <div>
                                                    <Text fw={500}>{institution.name}</Text>
                                                    <Text size="sm" c="dimmed">
                                                        Abonné depuis {new Date(subscription.created_at).toLocaleDateString('fr-FR')}
                                                    </Text>
                                                </div>
                                            </Group>

                                            <Group gap="xs">
                                                {isUserInstitution(institution.id) && (
                                                    <Badge color="green" variant="light">
                                                        Mon établissement
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant="light"
                                                    color="red"
                                                    size="sm"
                                                    disabled={isUserInstitution(institution.id)}
                                                    loading={unfollowingLoading === institution.id}
                                                    onClick={() => handleUnfollow(institution.id)}
                                                >
                                                    Se désabonner
                                                </Button>
                                            </Group>
                                        </Group>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </div>

                <Divider />

                {/* Section pour découvrir de nouveaux établissements */}
                <div>
                    <Title order={3} mb="md">
                        <IconPlus size={20} style={{ marginRight: 8 }} />
                        Découvrir de Nouveaux Établissements
                    </Title>

                    <TextInput
                        placeholder="Rechercher un établissement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        leftSection={<IconSearch size={16} />}
                        rightSection={
                            searchTerm && (
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() => setSearchTerm('')}
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
                        {filteredInstitutions.length === 0 ? (
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
                                                    color="blue"
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
                                                    <Badge color="blue" variant="light">
                                                        Déjà abonné
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant={following ? "light" : "filled"}
                                                    color={following ? "gray" : "blue"}
                                                    size="sm"
                                                    disabled={isOwnInstitution || following}
                                                    loading={followingLoading === institution.id}
                                                    onClick={() => following ? handleUnfollow(institution.id) : handleFollow(institution.id)}
                                                >
                                                    {following ? 'Se désabonner' : 'S\'abonner'}
                                                </Button>
                                            </Group>
                                        </Group>
                                    </Card>
                                );
                            })
                        )}
                    </Stack>
                </div>
            </Stack>
        </Paper>
    );
};

export default SubscriptionsList;
