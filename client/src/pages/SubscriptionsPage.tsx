import React from "react";
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
} from "@tabler/icons-react";
import { useUserContext } from "../contexts/UserContext";
import { useSubscriptions } from "../hooks/useSubscriptions";
import SubscriptionsList from "../components/SubscriptionsList";
import DiscoverInstitutions from "../components/DiscoverInstitutions";
import MainLayout from "../layouts/MainLayout";

const SubscriptionsPage: React.FC = () => {
    const userContext = useUserContext();
    const { subscriptions, loading: subscriptionsLoading, subscriptionCount, refreshSubscriptions } = useSubscriptions();
    
    // Vérification de sécurité pour éviter les erreurs pendant le hot reload
    if (!userContext) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Container size="md" py="xl">
                    <Center>
                        <Loader color="violet" size="lg" />
                    </Center>
                </Container>
            </MainLayout>
        );
    }

    const { user, isLoading: userLoading } = userContext;
    

    if (userLoading) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Container size="md" py="xl">
                    <Center>
                        <Loader color="violet" size="lg" />
                    </Center>
                </Container>
            </MainLayout>
        );
    }

    if (!user) {
        return (
                    <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
            <Container size="md" py="xl">
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Accès non autorisé"
                    color="red"
                    variant="light"
                >
                    Vous devez être connecté pour accéder à cette page.
                </Alert>
            </Container>
        </MainLayout>
        );
    }

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
            <Container size="xl" py="md">
                <Stack gap="xl">
                    {/* En-tête */}
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
                    </Group>

                    {/* Statistiques avec design sobre */}
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Card withBorder p="md" radius="md">
                            <Group gap="md" align="center">
                                <ThemeIcon
                                    size="md"
                                    radius="xl"
                                    color="violet"
                                    variant="light"
                                >
                                    <IconUsers size={16} />
                                </ThemeIcon>
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={2}>
                                        Abonnements
                                    </Text>
                                    <Text size="lg" fw={700} c="violet.6">
                                        {subscriptionCount}
                                    </Text>
                                </Box>
                            </Group>
                        </Card>

                        <Card withBorder p="md" radius="md">
                            <Group gap="md" align="center">
                                <ThemeIcon
                                    size="md"
                                    radius="xl"
                                    color="grape"
                                    variant="light"
                                >
                                    <IconBuilding size={16} />
                                </ThemeIcon>
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={2}>
                                        Institution
                                    </Text>
                                    <Text size="lg" fw={700} c="grape.6">
                                        {user?.institution?.name || "Aucune"}
                                    </Text>
                                </Box>
                            </Group>
                        </Card>
                    </SimpleGrid>

                    {/* Section principale avec onglets */}
                    <Paper withBorder p="lg" radius="md">
                        <Tabs defaultValue="subscriptions" variant="outline">
                            <Tabs.List mb="lg">
                                <Tabs.Tab 
                                    value="subscriptions" 
                                    leftSection={<IconHeart size={16} />}
                                >
                                    Mes Abonnements
                                </Tabs.Tab>
                                <Tabs.Tab 
                                    value="discover" 
                                    leftSection={<IconSearch size={16} />}
                                >
                                    Découvrir
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="subscriptions">
                                                                    <SubscriptionsList 
                                        onSubscriptionChange={refreshSubscriptions}
                                        subscriptions={subscriptions}
                                        loading={subscriptionsLoading}
                                        error={null}
                                        userInstitutionId={user?.institution?.id}
                                        userInstitutionName={user?.institution?.name}
                                    />
                            </Tabs.Panel>

                            <Tabs.Panel value="discover">
                                <DiscoverInstitutions 
                                    onSubscriptionChange={refreshSubscriptions}
                                    userInstitutionId={user?.institution?.id}
                                    currentSubscriptions={subscriptions}
                                />
                            </Tabs.Panel>
                        </Tabs>
                    </Paper>
                </Stack>
            </Container>
        </MainLayout>
    );
};

export default SubscriptionsPage;
