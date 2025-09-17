import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Stack,
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
    Box,
    ScrollArea,
    UnstyledButton,
    HoverCard,
    Tooltip
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
    IconSettings,
    IconArrowRight,
    IconCircle,
    IconCircleCheck,
    IconCircleX,
    IconClockPause,
    IconX
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
    inviter: string;
    message: string;
}

const ProjectsPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [projects, setProjects] = useState<Project[]>([]);
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);

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
                title: 'Plateforme d\'apprentissage en ligne',
                description: 'Création d\'une plateforme web complète pour l\'enseignement à distance avec vidéos, quiz et forums.',
                status: 'completed',
                progress: 100,
                startDate: '2023-09-01',
                endDate: '2023-12-15',
                participants: [
                    {
                        id: '1',
                        name: 'Marie Dubois',
                        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                        role: 'leader'
                    },
                    {
                        id: '4',
                        name: 'Alexandre Petit',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    }
                ],
                tags: ['React', 'Node.js', 'Éducation'],
                priority: 'medium',
                lastActivity: '2023-12-15T16:45:00',
                isPublic: true
            },
            {
                id: '3',
                title: 'Système de gestion de bibliothèque',
                description: 'Développement d\'un système complet pour la gestion des livres, prêts et retours dans une bibliothèque universitaire.',
                status: 'planning',
                progress: 15,
                startDate: '2024-02-01',
                endDate: '2024-06-30',
                participants: [
                    {
                        id: '2',
                        name: 'Pierre Martin',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                        role: 'leader'
                    },
                    {
                        id: '3',
                        name: 'Sophie Moreau',
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    },
                    {
                        id: '5',
                        name: 'Lucas Bernard',
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    }
                ],
                tags: ['Vue.js', 'Python', 'Base de données'],
                priority: 'medium',
                lastActivity: '2024-01-20T10:15:00',
                isPublic: false
            },
            {
                id: '4',
                title: 'Application de réalité augmentée',
                description: 'Création d\'une application mobile utilisant la RA pour l\'apprentissage des sciences naturelles.',
                status: 'on-hold',
                progress: 30,
                startDate: '2023-11-01',
                endDate: '2024-03-31',
                participants: [
                    {
                        id: '4',
                        name: 'Alexandre Petit',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                        role: 'leader'
                    },
                    {
                        id: '6',
                        name: 'Emma Rousseau',
                        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
                        role: 'member'
                    }
                ],
                tags: ['Unity', 'AR', 'Mobile', 'Éducation'],
                priority: 'low',
                lastActivity: '2023-12-10T09:30:00',
                isPublic: true
            }
        ];

        const mockInvitations: ProjectInvitation[] = [
            {
                id: '1',
                project: {
                    id: '5',
                    title: 'Projet de recherche IA',
                    description: 'Recherche sur l\'intelligence artificielle appliquée à l\'éducation.',
                    status: 'planning',
                    progress: 0,
                    startDate: '2024-03-01',
                    participants: [],
                    tags: ['IA', 'Recherche', 'Machine Learning'],
                    priority: 'high',
                    lastActivity: '2024-01-22T11:00:00',
                    isPublic: true
                },
                inviter: 'Dr. Sarah Johnson',
                message: 'Nous cherchons des étudiants motivés pour rejoindre notre équipe de recherche sur l\'IA éducative.'
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
            case 'completed': return 'green';
            case 'in-progress': return 'blue';
            case 'planning': return 'yellow';
            case 'on-hold': return 'gray';
            default: return 'gray';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <IconCircleCheck size={16} />;
            case 'in-progress': return <IconCircle size={16} />;
            case 'planning': return <IconClock size={16} />;
            case 'on-hold': return <IconClockPause size={16} />;
            default: return <IconCircle size={16} />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'red';
            case 'high': return 'orange';
            case 'medium': return 'blue';
            case 'low': return 'gray';
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
            <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* En-tête */}
                <Box pb="md">
                    <Group justify="space-between" align="center">
                        <Group>
                            <ThemeIcon size={40} radius="md" color="violet">
                                <IconUsers size={24} />
                            </ThemeIcon>
                            <div>
                                <Title order={1} size="h2" mb={0}>
                                    Projets
                                </Title>
                                <Text c="dimmed" size="sm">
                                    Gérez vos projets d'études en collaboration
                                </Text>
                            </div>
                        </Group>
                    </Group>
                </Box>

                <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Statistiques */}
                    <Box style={{ padding: '24px' }}>
                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                            <Box>
                                <Group gap="xs" mb="xs">
                                    <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                                        <IconUsers size={14} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed" fw={500}>Mes projets</Text>
                                </Group>
                                <Text size="2xl" fw={800} c="blue">
                                    {myProjects.length}
                                </Text>
                            </Box>

                            <Box>
                                <Group gap="xs" mb="xs">
                                    <ThemeIcon size="sm" radius="xl" color="green" variant="light">
                                        <IconTarget size={14} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed" fw={500}>En cours</Text>
                                </Group>
                                <Text size="2xl" fw={800} c="green">
                                    {inProgressProjects.length}
                                </Text>
                            </Box>

                            <Box>
                                <Group gap="xs" mb="xs">
                                    <ThemeIcon size="sm" radius="xl" color="gray" variant="light">
                                        <IconCheck size={14} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed" fw={500}>Terminés</Text>
                                </Group>
                                <Text size="2xl" fw={800} c="gray">
                                    {completedProjects.length}
                                </Text>
                            </Box>

                            <Box>
                                <Group gap="xs" mb="xs">
                                    <ThemeIcon size="sm" radius="xl" color="yellow" variant="light">
                                        <IconCalendar size={14} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed" fw={500}>En planification</Text>
                                </Group>
                                <Text size="2xl" fw={800} c="yellow">
                                    {planningProjects.length}
                                </Text>
                            </Box>
                        </SimpleGrid>
                    </Box>


                    {/* Contenu Principal */}
                    <Box style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
                        <ScrollArea style={{ height: '100%' }}>
                            <Stack gap="lg">
                                {/* Mes Projets */}
                                {myProjects.map((project) => (
                                            <Box
                                                key={project.id}
                                                style={{
                                                    padding: '24px',
                                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Group justify="space-between" mb="md">
                                                    <Box style={{ flex: 1 }}>
                                                        <Group gap="sm" mb="xs">
                                                            <Text fw={600} size="lg">{project.title}</Text>
                                                            <Badge
                                                                color={getStatusColor(project.status)}
                                                                variant="light"
                                                                leftSection={getStatusIcon(project.status)}
                                                            >
                                                                {project.status === 'in-progress' ? 'En cours' :
                                                                 project.status === 'completed' ? 'Terminé' :
                                                                 project.status === 'planning' ? 'Planification' : 'En pause'}
                                                            </Badge>
                                                            <Badge
                                                                color={getPriorityColor(project.priority)}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                {getPriorityLabel(project.priority)}
                                                            </Badge>
                                                        </Group>
                                                        <Text c="dimmed" size="sm" mb="md">
                                                            {project.description}
                                                        </Text>
                                                    </Box>
                                                    <Menu>
                                                        <Menu.Target>
                                                            <ActionIcon variant="subtle" size="sm">
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
                                                    <Progress
                                                        value={project.progress}
                                                        color={project.progress === 100 ? 'green' : 'blue'}
                                                        size="sm"
                                                        radius="xl"
                                                    />
                                                </Box>

                                                <Group justify="space-between">
                                                    <Group gap="xs">
                                                        <Text size="sm" c="dimmed">
                                                            <IconCalendar size={14} style={{ marginRight: '4px' }} />
                                                            {new Date(project.startDate).toLocaleDateString('fr-FR')}
                                                            {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('fr-FR')}`}
                                                        </Text>
                                                    </Group>
                                                    <Group gap="xs">
                                                        {project.participants.slice(0, 3).map((participant) => (
                                                            <Tooltip key={participant.id} label={participant.name}>
                                                                <Avatar
                                                                    src={participant.avatar}
                                                                    size="sm"
                                                                    radius="xl"
                                                                />
                                                            </Tooltip>
                                                        ))}
                                                        {project.participants.length > 3 && (
                                                            <Text size="xs" c="dimmed">
                                                                +{project.participants.length - 3}
                                                            </Text>
                                                        )}
                                                    </Group>
                                                </Group>

                                                <Group gap="xs" mt="md">
                                                    {project.tags.map((tag) => (
                                                        <Badge key={tag} variant="light" size="sm">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </Group>
                                            </Box>
                                        ))}

                                {/* Projets Disponibles */}
                                {projects
                                    .filter(p => p.isPublic && !p.participants.some(participant => participant.id === user.id))
                                    .map((project) => (
                                        <Box
                                            key={project.id}
                                            style={{
                                                padding: '24px',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Group justify="space-between" mb="md">
                                                <Box style={{ flex: 1 }}>
                                                    <Group gap="sm" mb="xs">
                                                        <Text fw={600} size="lg">{project.title}</Text>
                                                        <Badge
                                                            color={getStatusColor(project.status)}
                                                            variant="light"
                                                            leftSection={getStatusIcon(project.status)}
                                                        >
                                                            {project.status === 'in-progress' ? 'En cours' :
                                                             project.status === 'completed' ? 'Terminé' :
                                                             project.status === 'planning' ? 'Planification' : 'En pause'}
                                                        </Badge>
                                                    </Group>
                                                    <Text c="dimmed" size="sm" mb="md">
                                                        {project.description}
                                                    </Text>
                                                </Box>
                                                <Button size="sm" leftSection={<IconPlus size={16} />}>
                                                    Rejoindre
                                                </Button>
                                            </Group>

                                            <Group justify="space-between">
                                                <Group gap="xs">
                                                    <Text size="sm" c="dimmed">
                                                        <IconUsers size={14} style={{ marginRight: '4px' }} />
                                                        {project.participants.length} participant{project.participants.length > 1 ? 's' : ''}
                                                    </Text>
                                                </Group>
                                                <Group gap="xs">
                                                    {project.participants.slice(0, 3).map((participant) => (
                                                        <Tooltip key={participant.id} label={participant.name}>
                                                            <Avatar
                                                                src={participant.avatar}
                                                                size="sm"
                                                                radius="xl"
                                                            />
                                                        </Tooltip>
                                                    ))}
                                                </Group>
                                            </Group>

                                            <Group gap="xs" mt="md">
                                                {project.tags.map((tag) => (
                                                    <Badge key={tag} variant="light" size="sm">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </Group>
                                        </Box>
                                    ))}

                                {/* Invitations */}
                                {invitations.map((invitation) => (
                                    <Box
                                        key={invitation.id}
                                        style={{
                                            padding: '24px',
                                            background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                                            border: '1px solid #fed7aa',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <Group justify="space-between" mb="md">
                                            <Box style={{ flex: 1 }}>
                                                <Text fw={600} size="lg" mb="xs">
                                                    Invitation de {invitation.inviter}
                                                </Text>
                                                <Text fw={500} size="md" mb="xs">
                                                    {invitation.project.title}
                                                </Text>
                                                <Text c="dimmed" size="sm" mb="md">
                                                    {invitation.message}
                                                </Text>
                                            </Box>
                                            <Group gap="xs">
                                                <Button size="sm" color="green" leftSection={<IconCheck size={16} />}>
                                                    Accepter
                                                </Button>
                                                <Button size="sm" variant="light" color="red" leftSection={<IconX size={16} />}>
                                                    Refuser
                                                </Button>
                                            </Group>
                                        </Group>

                                        <Group gap="xs">
                                            {invitation.project.tags.map((tag) => (
                                                <Badge key={tag} variant="light" size="sm">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Box>
                                ))}
                            </Stack>
                        </ScrollArea>
                    </Box>
                </Box>
            </Box>
        </MainLayout>
    );
};

export default ProjectsPage;