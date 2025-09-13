import React, { useState } from "react";
import {
    Container,
    Title,
    Text,
    Stack,
    Group,
    Badge,
    Box,
    Paper,
    Skeleton,
    Alert,
    Center,
    Loader,
    Card,
    Grid,
    ThemeIcon,
    Divider,
    SimpleGrid,
    Tabs,
    Button,
    TextInput,
    ActionIcon,
    Select,
    MultiSelect,
} from "@mantine/core";
import { 
    IconBuilding, 
    IconUsers, 
    IconAlertCircle,
    IconSchool,
    IconTrendingUp,
    IconHeart,
    IconStar,
    IconSparkles,
    IconBuildingPlus,
    IconTarget,
    IconPlus,
    IconSearch,
    IconX,
    IconSortAscending,
    IconFilter,
    IconLayoutGrid,
    IconList,
} from "@tabler/icons-react";
import { useUserContext } from "../contexts/UserContext";
import { useSubscriptions } from "../hooks/useSubscriptions";
import SubscriptionsList from "../components/SubscriptionsList";
import DiscoverInstitutions from "../components/DiscoverInstitutions";
import MainLayout from "../layouts/MainLayout";

const SubscriptionsPage: React.FC = () => {
    const userContext = useUserContext();
    const { subscriptions, loading: subscriptionsLoading, subscriptionCount, refreshSubscriptions } = useSubscriptions();
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'discover'>('subscriptions');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<string>('name');
    const [filterTypes, setFilterTypes] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    
    // Vérification de sécurité pour éviter les erreurs pendant le hot reload
    if (!userContext) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                    <Center>
                        <Loader color="violet" size="lg" />
                    </Center>
            </MainLayout>
        );
    }

    const { user, isLoading: userLoading } = userContext;
    

    if (userLoading) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                    <Center>
                        <Loader color="violet" size="lg" />
                    </Center>
            </MainLayout>
        );
    }

    if (!user) {
        return (
                    <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Accès non autorisé"
                    color="red"
                    variant="light"
                >
                    Vous devez être connecté pour accéder à cette page.
                </Alert>
        </MainLayout>
        );
    }

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Stack gap="xl">
                    {/* En-tête avec statistiques à droite */}
                    <Group justify="space-between" align="center" mb="xl">
                        <Group>
                            <ThemeIcon size={40} radius="md" color="violet">
                                <IconBuildingPlus size={24} />
                            </ThemeIcon>
                            <div>
                                <Title order={1} size="h2">
                                    Mes Abonnements
                                </Title>
                                <Text c="dimmed" size="sm">
                                    Gérez vos abonnements aux institutions et découvrez de nouveaux établissements
                                </Text>
                            </div>
                        </Group>
                        
                        {/* Statistiques à droite */}
                        <Group gap="xl">
                            <Group gap="sm">
                                <ThemeIcon
                                    size="sm"
                                    radius="md"
                                    color="violet"
                                    variant="light"
                                >
                                    <IconUsers size={14} />
                                </ThemeIcon>
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                                        Abonnements
                                    </Text>
                                    <Text size="lg" fw={700} c="violet.6">
                                        {subscriptionCount}
                                    </Text>
                                </Box>
                            </Group>
                            
                            <Group gap="sm">
                                <ThemeIcon
                                    size="sm"
                                    radius="md"
                                    color="grape"
                                    variant="light"
                                >
                                    <IconBuilding size={14} />
                                </ThemeIcon>
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                                        Institution
                                    </Text>
                                    <Text size="lg" fw={700} c="grape.6">
                                        {user?.institution?.name || "Aucune"}
                                    </Text>
                                </Box>
                            </Group>
                        </Group>
                    </Group>

                    {/* Navigation par boutons libres avec contrôles de découverte */}
                    <Group justify="space-between" align="flex-end" mb="lg">
                        <Group gap="xs">
                            <Button
                                variant={activeTab === 'subscriptions' ? 'filled' : 'light'}
                                color="violet"
                                leftSection={<IconHeart size={16} />}
                                radius="md"
                                onClick={() => setActiveTab('subscriptions')}
                            >
                                Mes Abonnements
                            </Button>
                            <Button
                                variant={activeTab === 'discover' ? 'filled' : 'subtle'}
                                color="violet"
                                leftSection={<IconSearch size={16} />}
                                radius="md"
                                onClick={() => setActiveTab('discover')}
                            >
                                Découvrir
                            </Button>
                        </Group>
                        
                        {/* Contrôles de découverte visibles seulement en mode découverte */}
                        {activeTab === 'discover' && (
                            <Group gap="md" align="flex-end">
                                <Select
                                    placeholder="Trier par"
                                    data={sortOptions}
                                    value={sortBy}
                                    onChange={(value) => setSortBy(value || 'name')}
                                    leftSection={<IconSortAscending size={16} />}
                                    style={{ minWidth: 150 }}
                                    size="sm"
                                />
                                
                                <MultiSelect
                                    placeholder="Filtrer par type"
                                    data={typeOptions}
                                    value={filterTypes}
                                    onChange={setFilterTypes}
                                    leftSection={<IconFilter size={16} />}
                                    style={{ minWidth: 180 }}
                                    size="sm"
                                    clearable
                                />
                                
                                <TextInput
                                    placeholder="Rechercher..."
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
                                    style={{ minWidth: 250 }}
                                    size="sm"
                                />

                                {/* Bouton toggle pour changer l'affichage */}
                                <Group gap="xs">
                                    <Button
                                        variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                                        color="violet"
                                        size="sm"
                                        radius="md"
                                        onClick={() => setViewMode('grid')}
                                        title="Vue grille"
                                        p="xs"
                                    >
                                        <IconLayoutGrid size={16} />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'filled' : 'subtle'}
                                        color="violet"
                                        size="sm"
                                        radius="md"
                                        onClick={() => setViewMode('list')}
                                        title="Vue liste"
                                        p="xs"
                                    >
                                        <IconList size={16} />
                                    </Button>
                                </Group>
                            </Group>
                        )}
                    </Group>

                    {/* Contenu principal */}
                    {activeTab === 'subscriptions' ? (
                        <SubscriptionsList 
                            onSubscriptionChange={refreshSubscriptions}
                            subscriptions={subscriptions}
                            loading={subscriptionsLoading}
                            error={null}
                            userInstitutionId={user?.institution?.id}
                            userInstitutionName={user?.institution?.name}
                        />
                    ) : (
                        <DiscoverInstitutions 
                            onSubscriptionChange={refreshSubscriptions}
                            userInstitutionId={user?.institution?.id}
                            currentSubscriptions={subscriptions}
                            searchTerm={searchTerm}
                            sortBy={sortBy}
                            filterTypes={filterTypes}
                            viewMode={viewMode}
                        />
                    )}
                </Stack>
        </MainLayout>
    );
};

export default SubscriptionsPage;
