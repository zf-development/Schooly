import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Stack,
    Card,
    Text,
    Group,
    Badge,
    Button,
    Paper,
    SimpleGrid,
    ThemeIcon,
    Center,
    Loader,
    Avatar,
    Progress,
    ActionIcon,
    Menu,
    Tabs,
    Timeline,
    Divider,
    Flex,
    Box
} from '@mantine/core';
import {
    IconUsers,
    IconTarget,
    IconCheck,
    IconCalendar,
    IconDots,
    IconEdit,
    IconTrash,
    IconEye,
    IconShare,
    IconClock,
    IconUser,
    IconPlus,
    IconFlame,
    IconStar,
    IconTrendingUp,
    IconMessage,
    IconFileText,
    IconSettings
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

interface Project {
    id: string;
    title: string;
    description: string;
    status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
    progress: number;
    startDate: string;
    endDate?: string;
    participants: {
        id: string;
        name: string;
        avatar: string;
        role: 'leader' | 'member' | 'observer';
    }[];
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    lastActivity: string;
    isPublic: boolean;
}

interface ProjectInvitation {
    id: string;
    project: Project;
    inviter: {
        name: string;
        avatar: string;
    };
    message: string;
    createdAt: string;
}

const ProjectsPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [projects, setProjects] = useState<Project[]>([]);
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
    const [activeTab, setActiveTab] = useState<string>('my-projects');

    // Données placeholder
    useEffect(() => {
        const mockProjects: Project[] = [
            {
                id: '1',
                title: 'Application mobile de gestion scolaire',
                description: 'Développement d\'une application mobile pour la gestion des cours, devoirs et communications entre étudiants et professeurs.',
                status: 'in-progress',
                progress: 65,
                startDate: '2024-01-15',
                endDate: '2024-04-15',
                participants: [
                    {
                        id: '1',
                        name: 'Marie Dubois',
                        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                        role: 'leader'
                    },
                    {
                        id: '2',
                        name: 'Pierre Martin',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    },
                    {
                        id: '3',
                        name: 'Sophie Moreau',
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    }
                ],
                tags: ['React Native', 'Mobile', 'Éducation'],
                priority: 'high',
                lastActivity: '2024-01-25T14:30:00',
                isPublic: true
            },
            {
                id: '2',
                title: 'Système de gestion de bibliothèque',
                description: 'Création d\'un système web pour la gestion des emprunts et retours de livres dans la bibliothèque universitaire.',
                status: 'planning',
                progress: 20,
                startDate: '2024-02-01',
                endDate: '2024-06-01',
                participants: [
                    {
                        id: '4',
                        name: 'Lucas Rousseau',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                        role: 'leader'
                    },
                    {
                        id: '5',
                        name: 'Emma Petit',
                        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    }
                ],
                tags: ['Vue.js', 'Node.js', 'Base de données'],
                priority: 'medium',
                lastActivity: '2024-01-24T10:15:00',
                isPublic: false
            },
            {
                id: '3',
                title: 'Plateforme d\'apprentissage en ligne',
                description: 'Développement d\'une plateforme complète pour l\'enseignement à distance avec vidéos, quiz et forums.',
                status: 'completed',
                progress: 100,
                startDate: '2023-09-01',
                endDate: '2023-12-15',
                participants: [
                    {
                        id: '6',
                        name: 'Alexandre Durand',
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                        role: 'leader'
                    },
                    {
                        id: '7',
                        name: 'Camille Bernard',
                        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    }
                ],
                tags: ['React', 'Express', 'MongoDB', 'Éducation'],
                priority: 'low',
                lastActivity: '2023-12-15T16:45:00',
                isPublic: true
            },
            {
                id: '4',
                title: 'Analyse de données climatiques',
                description: 'Projet de recherche sur l\'analyse des tendances climatiques à l\'aide de machine learning et visualisation de données.',
                status: 'on-hold',
                progress: 40,
                startDate: '2024-01-10',
                participants: [
                    {
                        id: '8',
                        name: 'Thomas Leroy',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                        role: 'leader'
                    }
                ],
                tags: ['Python', 'Machine Learning', 'Data Science'],
                priority: 'urgent',
                lastActivity: '2024-01-20T09:30:00',
                isPublic: true
            }
        ];

        const mockInvitations: ProjectInvitation[] = [
            {
                id: '1',
                project: {
                    id: '5',
                    title: 'Application de covoiturage étudiant',
                    description: 'Développement d\'une app pour faciliter le covoiturage entre étudiants du campus.',
                    status: 'planning',
                    progress: 0,
                    startDate: '2024-02-15',
                    participants: [],
                    tags: ['Flutter', 'Mobile', 'Transport'],
                    priority: 'medium',
                    lastActivity: '2024-01-25T12:00:00',
                    isPublic: true
                },
                inviter: {
                    name: 'Julie Moreau',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                },
                message: 'Salut ! J\'ai vu que tu travailles sur des projets mobiles. Ça t\'intéresserait de rejoindre notre équipe pour cette app de covoiturage ?',
                createdAt: '2024-01-25T12:00:00'
            },
            {
                id: '2',
                project: {
                    id: '6',
                    title: 'Système de vote électronique',
                    description: 'Création d\'une plateforme sécurisée pour les votes étudiants et les élections universitaires.',
                    status: 'in-progress',
                    progress: 30,
                    startDate: '2024-01-20',
                    participants: [],
                    tags: ['Blockchain', 'Sécurité', 'Démocratie'],
                    priority: 'high',
                    lastActivity: '2024-01-25T08:30:00',
                    isPublic: false
                },
                inviter: {
                    name: 'Marc Lefebvre',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                },
                message: 'Nous cherchons un développeur frontend expérimenté pour notre projet de vote électronique. Intéressé ?',
                createdAt: '2024-01-24T15:20:00'
            }
        ];

        setProjects(mockProjects);
        setInvitations(mockInvitations);
    }, []);

    if (!user) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in-progress': return 'blue';
            case 'completed': return 'green';
            case 'planning': return 'yellow';
            case 'on-hold': return 'orange';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'in-progress': return 'En cours';
            case 'completed': return 'Terminé';
            case 'planning': return 'Planification';
            case 'on-hold': return 'En pause';
            default: return 'Inconnu';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'red';
            case 'high': return 'orange';
            case 'medium': return 'yellow';
            case 'low': return 'green';
            default: return 'gray';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'Urgent';
            case 'high': return 'Élevée';
            case 'medium': return 'Moyenne';
            case 'low': return 'Faible';
            default: return 'Inconnue';
        }
    };

    const myProjects = projects.filter(p => p.participants.some(participant => participant.id === user.id));
    const inProgressProjects = projects.filter(p => p.status === 'in-progress');
    const completedProjects = projects.filter(p => p.status === 'completed');
    const planningProjects = projects.filter(p => p.status === 'planning');

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
            <Container size="xl" py="md">
                <Stack gap="xl">
                    <Paper withBorder p="lg" radius="md">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Title order={1} size="h2" mb="xs">
                                    Projets collaboratifs
                                </Title>
                                <Text size="sm" c="dimmed" mb="md">
                                    Gérez vos projets d'études en collaboration avec d'autres étudiants
                                </Text>
                            </div>
                            <Button
                                leftSection={<IconPlus size={16} />}
                                variant="light"
                                disabled
                            >
                                Nouveau projet
                            </Button>
                        </Group>
                    </Paper>

                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                        <Card withBorder p="lg" radius="md">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" fw={500}>Mes projets</Text>
                                    <Text size="2xl" fw={800} c="blue">
                                        {myProjects.length}
                                    </Text>
                                </div>
                                <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                                    <IconUsers size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>

                        <Card withBorder p="lg" radius="md">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" fw={500}>En cours</Text>
                                    <Text size="2xl" fw={800} c="green">
                                        {inProgressProjects.length}
                                    </Text>
                                </div>
                                <ThemeIcon size="xl" radius="xl" color="green" variant="light">
                                    <IconTarget size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>

                        <Card withBorder p="lg" radius="md">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" fw={500}>Terminés</Text>
                                    <Text size="2xl" fw={800} c="gray">
                                        {completedProjects.length}
                                    </Text>
                                </div>
                                <ThemeIcon size="xl" radius="xl" color="gray" variant="light">
                                    <IconCheck size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>

                        <Card withBorder p="lg" radius="md">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" fw={500}>En planification</Text>
                                    <Text size="2xl" fw={800} c="yellow">
                                        {planningProjects.length}
                                    </Text>
                                </div>
                                <ThemeIcon size="xl" radius="xl" color="yellow" variant="light">
                                    <IconCalendar size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </SimpleGrid>

                    <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'my-projects')}>
                        <Tabs.List>
                            <Tabs.Tab value="my-projects" leftSection={<IconUsers size={16} />}>
                                Mes projets ({myProjects.length})
                            </Tabs.Tab>
                            <Tabs.Tab value="available" leftSection={<IconTarget size={16} />}>
                                Disponibles ({projects.filter(p => p.isPublic && !p.participants.some(participant => participant.id === user.id)).length})
                            </Tabs.Tab>
                            <Tabs.Tab value="invitations" leftSection={<IconMessage size={16} />}>
                                Invitations ({invitations.length})
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="my-projects" pt="md">
                            <Stack gap="md">
                                {myProjects.map((project) => (
                                    <Card key={project.id} withBorder p="lg" radius="md">
                                        <Group justify="space-between" align="flex-start" mb="md">
                                            <div style={{ flex: 1 }}>
                                                <Group gap="sm" mb="xs">
                                                    <Title order={3} size="h4">
                                                        {project.title}
                                                    </Title>
                                                    <Badge color={getStatusColor(project.status)} variant="light">
                                                        {getStatusLabel(project.status)}
                                                    </Badge>
                                                    <Badge color={getPriorityColor(project.priority)} variant="outline">
                                                        {getPriorityLabel(project.priority)}
                                                    </Badge>
                                                </Group>
                                                <Text size="sm" c="dimmed" mb="md">
                                                    {project.description}
                                                </Text>
                                                <Group gap="sm" mb="md">
                                                    {project.tags.map((tag) => (
                                                        <Badge key={tag} variant="light" size="sm">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </Group>
                                            </div>
                                            <Menu>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDots size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item leftSection={<IconEye size={16} />}>
                                                        Voir
                                                    </Menu.Item>
                                                    <Menu.Item leftSection={<IconEdit size={16} />}>
                                                        Modifier
                                                    </Menu.Item>
                                                    <Menu.Item leftSection={<IconShare size={16} />}>
                                                        Partager
                                                    </Menu.Item>
                                                    <Menu.Divider />
                                                    <Menu.Item leftSection={<IconTrash size={16} />} color="red">
                                                        Supprimer
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>

                                        <Box mb="md">
                                            <Group justify="space-between" mb="xs">
                                                <Text size="sm" fw={500}>Progression</Text>
                                                <Text size="sm" c="dimmed">{project.progress}%</Text>
                                            </Group>
                                            <Progress value={project.progress} size="sm" radius="xl" />
                                        </Box>

                                        <Group justify="space-between" align="center">
                                            <Group gap="xs">
                                                <Text size="sm" c="dimmed">
                                                    <IconClock size={14} style={{ display: 'inline', marginRight: 4 }} />
                                                    Dernière activité: {new Date(project.lastActivity).toLocaleDateString('fr-FR')}
                                                </Text>
                                            </Group>
                                            <Group gap="xs">
                                                <Text size="sm" c="dimmed">
                                                    {project.participants.length} participant{project.participants.length > 1 ? 's' : ''}
                                                </Text>
                                                <Group gap="xs">
                                                    {project.participants.slice(0, 3).map((participant) => (
                                                        <Avatar
                                                            key={participant.id}
                                                            src={participant.avatar}
                                                            size="sm"
                                                            radius="xl"
                                                        />
                                                    ))}
                                                    {project.participants.length > 3 && (
                                                        <Avatar size="sm" radius="xl" color="gray">
                                                            +{project.participants.length - 3}
                                                        </Avatar>
                                                    )}
                                                </Group>
                                            </Group>
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="available" pt="md">
                            <Stack gap="md">
                                {projects
                                    .filter(p => p.isPublic && !p.participants.some(participant => participant.id === user.id))
                                    .map((project) => (
                                        <Card key={project.id} withBorder p="lg" radius="md">
                                            <Group justify="space-between" align="flex-start" mb="md">
                                                <div style={{ flex: 1 }}>
                                                    <Group gap="sm" mb="xs">
                                                        <Title order={3} size="h4">
                                                            {project.title}
                                                        </Title>
                                                        <Badge color={getStatusColor(project.status)} variant="light">
                                                            {getStatusLabel(project.status)}
                                                        </Badge>
                                                        <Badge color={getPriorityColor(project.priority)} variant="outline">
                                                            {getPriorityLabel(project.priority)}
                                                        </Badge>
                                                    </Group>
                                                    <Text size="sm" c="dimmed" mb="md">
                                                        {project.description}
                                                    </Text>
                                                    <Group gap="sm" mb="md">
                                                        {project.tags.map((tag) => (
                                                            <Badge key={tag} variant="light" size="sm">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </Group>
                                                </div>
                                                <Button variant="light" size="sm">
                                                    Rejoindre
                                                </Button>
                                            </Group>

                                            <Group justify="space-between" align="center">
                                                <Text size="sm" c="dimmed">
                                                    <IconUser size={14} style={{ display: 'inline', marginRight: 4 }} />
                                                    Créé par {project.participants.find(p => p.role === 'leader')?.name}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {project.participants.length} participant{project.participants.length > 1 ? 's' : ''}
                                                </Text>
                                            </Group>
                                        </Card>
                                    ))}
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="invitations" pt="md">
                            <Stack gap="md">
                                {invitations.map((invitation) => (
                                    <Card key={invitation.id} withBorder p="lg" radius="md">
                                        <Group justify="space-between" align="flex-start" mb="md">
                                            <div style={{ flex: 1 }}>
                                                <Group gap="sm" mb="xs">
                                                    <Title order={3} size="h4">
                                                        {invitation.project.title}
                                                    </Title>
                                                    <Badge color="blue" variant="light">
                                                        Invitation
                                                    </Badge>
                                                </Group>
                                                <Text size="sm" c="dimmed" mb="md">
                                                    {invitation.project.description}
                                                </Text>
                                                <Group gap="sm" mb="md">
                                                    {invitation.project.tags.map((tag) => (
                                                        <Badge key={tag} variant="light" size="sm">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </Group>
                                                <Paper p="sm" radius="md" bg="gray.0" mb="md">
                                                    <Group gap="sm" mb="xs">
                                                        <Avatar
                                                            src={invitation.inviter.avatar}
                                                            size="sm"
                                                            radius="xl"
                                                        />
                                                        <Text size="sm" fw={500}>
                                                            {invitation.inviter.name}
                                                        </Text>
                                                    </Group>
                                                    <Text size="sm" c="dimmed">
                                                        "{invitation.message}"
                                                    </Text>
                                                </Paper>
                                            </div>
                                            <Group gap="sm">
                                                <Button variant="light" color="red" size="sm">
                                                    Refuser
                                                </Button>
                                                <Button size="sm">
                                                    Accepter
                                                </Button>
                                            </Group>
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                </Stack>
            </Container>
        </MainLayout>
    );
};

export default ProjectsPage;

