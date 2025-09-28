import React, { useState } from 'react';
import {
    Title,
    Text,
    Group,
    Stack,
    Card,
    Badge,
    Button,
    ThemeIcon,
    SimpleGrid,
    Tabs,
    Divider,
    Modal,
    TextInput,
    Textarea,
    Select,
    NumberInput,
    Switch,
    Paper,
} from '@mantine/core';
import {
    IconBrain,
    IconTrophy,
    IconTarget,
    IconPlus,
    IconEye,
    IconPlayerPlay,
    IconCheck,
    IconX,
    IconCalendar,
    IconUsers,
    IconChartBar,
    IconBook,
} from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Types
interface Quiz {
    id: string;
    title: string;
    description: string;
    subject: string;
    difficulty: 'facile' | 'moyen' | 'difficile';
    duration: number; // en minutes
    questionsCount: number;
    maxScore: number;
    status: 'draft' | 'published' | 'completed' | 'expired';
    dueDate?: string;
    attempts: number;
    maxAttempts: number;
    isTimed: boolean;
    allowRetake: boolean;
    instructions?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    author: {
        name: string;
        avatar?: string;
    };
    statistics?: {
        averageScore: number;
        completionRate: number;
        totalAttempts: number;
        bestScore: number;
    };
}

interface QuizAttempt {
    id: string;
    quizId: string;
    score: number;
    maxScore: number;
    percentage: number;
    timeSpent: number; // en minutes
    completedAt: string;
    answers: {
        questionId: string;
        answer: string;
        isCorrect: boolean;
        points: number;
    }[];
}

// Données placeholder
const mockQuizzes: Quiz[] = [
    {
        id: '1',
        title: 'Quiz de Mathématiques - Algèbre linéaire',
        description: 'Évaluation des concepts fondamentaux de l\'algèbre linéaire : matrices, déterminants, espaces vectoriels.',
        subject: 'Mathématiques',
        difficulty: 'moyen',
        duration: 45,
        questionsCount: 20,
        maxScore: 100,
        status: 'published',
        dueDate: '2024-12-15T23:59:00Z',
        attempts: 0,
        maxAttempts: 3,
        isTimed: true,
        allowRetake: true,
        instructions: 'Lisez attentivement chaque question. Vous avez 45 minutes pour compléter le quiz.',
        tags: ['algèbre', 'matrices', 'déterminants'],
        createdAt: '2024-11-01T10:00:00Z',
        updatedAt: '2024-11-01T10:00:00Z',
        author: {
            name: 'Prof. Dubois',
            avatar: ''
        },
        statistics: {
            averageScore: 78.5,
            completionRate: 85,
            totalAttempts: 127,
            bestScore: 95
        }
    },
    {
        id: '2',
        title: 'Quiz de Physique - Mécanique quantique',
        description: 'Questions sur les principes de base de la mécanique quantique et ses applications.',
        subject: 'Physique',
        difficulty: 'difficile',
        duration: 60,
        questionsCount: 25,
        maxScore: 100,
        status: 'published',
        dueDate: '2024-12-20T23:59:00Z',
        attempts: 1,
        maxAttempts: 2,
        isTimed: true,
        allowRetake: true,
        instructions: 'Quiz en deux parties : questions théoriques (40 min) et problèmes pratiques (20 min).',
        tags: ['quantique', 'mécanique', 'physique'],
        createdAt: '2024-11-05T14:30:00Z',
        updatedAt: '2024-11-05T14:30:00Z',
        author: {
            name: 'Prof. Martin',
            avatar: ''
        },
        statistics: {
            averageScore: 65.2,
            completionRate: 72,
            totalAttempts: 89,
            bestScore: 88
        }
    },
    {
        id: '3',
        title: 'Quiz de Chimie - Thermodynamique',
        description: 'Évaluation des lois de la thermodynamique et des transformations chimiques.',
        subject: 'Chimie',
        difficulty: 'moyen',
        duration: 30,
        questionsCount: 15,
        maxScore: 100,
        status: 'completed',
        dueDate: '2024-11-30T23:59:00Z',
        attempts: 2,
        maxAttempts: 2,
        isTimed: true,
        allowRetake: false,
        instructions: 'Quiz court et ciblé sur les concepts essentiels de la thermodynamique.',
        tags: ['thermodynamique', 'chimie', 'énergie'],
        createdAt: '2024-10-15T09:00:00Z',
        updatedAt: '2024-10-15T09:00:00Z',
        author: {
            name: 'Prof. Leroy',
            avatar: ''
        },
        statistics: {
            averageScore: 82.1,
            completionRate: 95,
            totalAttempts: 156,
            bestScore: 98
        }
    },
    {
        id: '4',
        title: 'Quiz de Biologie - Génétique',
        description: 'Questions sur l\'hérédité, l\'ADN, et les mécanismes génétiques.',
        subject: 'Biologie',
        difficulty: 'facile',
        duration: 25,
        questionsCount: 12,
        maxScore: 100,
        status: 'published',
        dueDate: '2024-12-10T23:59:00Z',
        attempts: 0,
        maxAttempts: 5,
        isTimed: false,
        allowRetake: true,
        instructions: 'Quiz sans limite de temps. Prenez votre temps pour réfléchir.',
        tags: ['génétique', 'ADN', 'hérédité'],
        createdAt: '2024-11-10T16:45:00Z',
        updatedAt: '2024-11-10T16:45:00Z',
        author: {
            name: 'Prof. Moreau',
            avatar: ''
        },
        statistics: {
            averageScore: 89.3,
            completionRate: 91,
            totalAttempts: 203,
            bestScore: 100
        }
    },
    {
        id: '5',
        title: 'Quiz d\'Histoire - Révolution française',
        description: 'Évaluation des connaissances sur la période révolutionnaire française (1789-1799).',
        subject: 'Histoire',
        difficulty: 'moyen',
        duration: 40,
        questionsCount: 18,
        maxScore: 100,
        status: 'expired',
        dueDate: '2024-11-25T23:59:00Z',
        attempts: 0,
        maxAttempts: 1,
        isTimed: true,
        allowRetake: false,
        instructions: 'Quiz unique sur la Révolution française. Attention aux dates et aux personnages clés.',
        tags: ['révolution', 'histoire', 'France'],
        createdAt: '2024-10-20T11:15:00Z',
        updatedAt: '2024-10-20T11:15:00Z',
        author: {
            name: 'Prof. Rousseau',
            avatar: ''
        },
        statistics: {
            averageScore: 76.8,
            completionRate: 88,
            totalAttempts: 134,
            bestScore: 92
        }
    }
];

const mockAttempts: QuizAttempt[] = [
    {
        id: '1',
        quizId: '2',
        score: 75,
        maxScore: 100,
        percentage: 75,
        timeSpent: 58,
        completedAt: '2024-11-28T15:30:00Z',
        answers: []
    },
    {
        id: '2',
        quizId: '3',
        score: 88,
        maxScore: 100,
        percentage: 88,
        timeSpent: 28,
        completedAt: '2024-11-25T10:15:00Z',
        answers: []
    }
];

const QuizzesPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<string>('all');
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Filtrage des quiz par statut
    const getFilteredQuizzes = () => {
        switch (selectedTab) {
            case 'available':
                return mockQuizzes.filter(q => q.status === 'published' && q.attempts < q.maxAttempts);
            case 'completed':
                return mockQuizzes.filter(q => q.status === 'completed');
            case 'expired':
                return mockQuizzes.filter(q => q.status === 'expired');
            case 'draft':
                return mockQuizzes.filter(q => q.status === 'draft');
            default:
                return mockQuizzes;
        }
    };

    const filteredQuizzes = getFilteredQuizzes();

    // Statistiques
    const stats = {
        totalQuizzes: mockQuizzes.length,
        availableQuizzes: mockQuizzes.filter(q => q.status === 'published' && q.attempts < q.maxAttempts).length,
        completedQuizzes: mockQuizzes.filter(q => q.status === 'completed').length,
        averageScore: mockAttempts.length > 0 ? mockAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / mockAttempts.length : 0
    };

    // Gestion des couleurs de difficulté
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'facile': return 'green';
            case 'moyen': return 'yellow';
            case 'difficile': return 'red';
            default: return 'gray';
        }
    };

    // Gestion des couleurs de statut
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'blue';
            case 'completed': return 'green';
            case 'expired': return 'red';
            case 'draft': return 'gray';
            default: return 'gray';
        }
    };

    // Gestion des labels de statut
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Disponible';
            case 'completed': return 'Terminé';
            case 'expired': return 'Expiré';
            case 'draft': return 'Brouillon';
            default: return status;
        }
    };

    const handleStartQuiz = (quiz: Quiz) => {
        console.log('Démarrage du quiz:', quiz.title);
        // Ici, vous pourriez rediriger vers la page de quiz
    };

    const handleViewDetails = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsDetailsModalOpen(true);
    };

    const handleCreateQuiz = () => {
        setIsCreateModalOpen(true);
    };

    return (
        <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
            {/* En-tête */}
            <Group justify="space-between" align="center" mb="xl">
                <Group>
                    <ThemeIcon size={40} radius="md" color="violet">
                        <IconBrain size={24} />
                    </ThemeIcon>
                    <div>
                        <Title order={1} size="h2">
                            Quiz
                        </Title>
                        <Text c="dimmed" size="sm">
                            Évaluations et tests de connaissances
                        </Text>
                    </div>
                </Group>
                <Group>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={handleCreateQuiz}
                        variant="light"
                    >
                        Créer un quiz
                    </Button>
                </Group>
            </Group>

            <Stack gap="xl">
                {/* Statistiques */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Total
                                </Text>
                                <Text size="xl" fw={700} c="violet">
                                    {stats.totalQuizzes}
                                </Text>
                            </div>
                            <ThemeIcon size={40} radius="md" color="violet" variant="light">
                                <IconBrain size={20} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Disponibles
                                </Text>
                                <Text size="xl" fw={700} c="blue">
                                    {stats.availableQuizzes}
                                </Text>
                            </div>
                            <ThemeIcon size={40} radius="md" color="blue" variant="light">
                                <IconTarget size={20} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Terminés
                                </Text>
                                <Text size="xl" fw={700} c="green">
                                    {stats.completedQuizzes}
                                </Text>
                            </div>
                            <ThemeIcon size={40} radius="md" color="green" variant="light">
                                <IconCheck size={20} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Score moyen
                                </Text>
                                <Text size="xl" fw={700} c="orange">
                                    {stats.averageScore.toFixed(1)}%
                                </Text>
                            </div>
                            <ThemeIcon size={40} radius="md" color="orange" variant="light">
                                <IconTrophy size={20} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Onglets de filtrage */}
                <Tabs value={selectedTab} onChange={(value) => setSelectedTab(value || 'all')}>
                    <Tabs.List>
                        <Tabs.Tab value="all" leftSection={<IconBook size={16} />}>
                            Tous ({mockQuizzes.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="available" leftSection={<IconTarget size={16} />}>
                            Disponibles ({stats.availableQuizzes})
                        </Tabs.Tab>
                        <Tabs.Tab value="completed" leftSection={<IconCheck size={16} />}>
                            Terminés ({stats.completedQuizzes})
                        </Tabs.Tab>
                        <Tabs.Tab value="expired" leftSection={<IconX size={16} />}>
                            Expirés ({mockQuizzes.filter(q => q.status === 'expired').length})
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="all" pt="md">
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                            {filteredQuizzes.map((quiz) => (
                                <Card key={quiz.id} withBorder p="lg" radius="md" h="100%">
                                    <Stack gap="md" h="100%">
                                        {/* En-tête du quiz */}
                                        <Group justify="space-between" align="flex-start">
                                            <div style={{ flex: 1 }}>
                                                <Title order={3} size="h4" mb="xs">
                                                    {quiz.title}
                                                </Title>
                                                <Text size="sm" c="dimmed" lineClamp={2}>
                                                    {quiz.description}
                                                </Text>
                                            </div>
                                            <Badge
                                                color={getStatusColor(quiz.status)}
                                                variant="light"
                                                size="sm"
                                            >
                                                {getStatusLabel(quiz.status)}
                                            </Badge>
                                        </Group>

                                        {/* Informations du quiz */}
                                        <Stack gap="xs">
                                            <Group justify="space-between">
                                                <Text size="sm" fw={500}>
                                                    {quiz.subject}
                                                </Text>
                                                <Badge
                                                    color={getDifficultyColor(quiz.difficulty)}
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {quiz.difficulty}
                                                </Badge>
                                            </Group>

                                            <Group justify="space-between">
                                                <Text size="sm" c="dimmed">
                                                    {quiz.questionsCount} questions
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {quiz.duration} min
                                                </Text>
                                            </Group>

                                            {quiz.dueDate && (
                                                <Group gap="xs">
                                                    <IconCalendar size={14} />
                                                    <Text size="sm" c="dimmed">
                                                        Échéance: {formatDate(quiz.dueDate)}
                                                    </Text>
                                                </Group>
                                            )}

                                            {quiz.attempts > 0 && (
                                                <Group gap="xs">
                                                    <IconUsers size={14} />
                                                    <Text size="sm" c="dimmed">
                                                        {quiz.attempts}/{quiz.maxAttempts} tentatives
                                                    </Text>
                                                </Group>
                                            )}
                                        </Stack>

                                        {/* Statistiques si disponibles */}
                                        {quiz.statistics && (
                                            <Paper p="sm" radius="md" bg="gray.0">
                                                <Stack gap="xs">
                                                    <Group justify="space-between">
                                                        <Text size="xs" c="dimmed">
                                                            Score moyen
                                                        </Text>
                                                        <Text size="sm" fw={600}>
                                                            {quiz.statistics.averageScore}%
                                                        </Text>
                                                    </Group>
                                                    <Group justify="space-between">
                                                        <Text size="xs" c="dimmed">
                                                            Taux de réussite
                                                        </Text>
                                                        <Text size="sm" fw={600}>
                                                            {quiz.statistics.completionRate}%
                                                        </Text>
                                                    </Group>
                                                </Stack>
                                            </Paper>
                                        )}

                                        {/* Actions */}
                                        <Group justify="space-between" mt="auto">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                leftSection={<IconEye size={16} />}
                                                onClick={() => handleViewDetails(quiz)}
                                            >
                                                Détails
                                            </Button>
                                            {quiz.status === 'published' && quiz.attempts < quiz.maxAttempts && (
                                                <Button
                                                    size="sm"
                                                    leftSection={<IconPlayerPlay size={16} />}
                                                    onClick={() => handleStartQuiz(quiz)}
                                                >
                                                    Commencer
                                                </Button>
                                            )}
                                        </Group>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </Tabs.Panel>

                    <Tabs.Panel value="available" pt="md">
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                            {mockQuizzes
                                .filter(q => q.status === 'published' && q.attempts < q.maxAttempts)
                                .map((quiz) => (
                                    <Card key={quiz.id} withBorder p="lg" radius="md" h="100%">
                                        <Stack gap="md" h="100%">
                                            <Group justify="space-between" align="flex-start">
                                                <div style={{ flex: 1 }}>
                                                    <Title order={3} size="h4" mb="xs">
                                                        {quiz.title}
                                                    </Title>
                                                    <Text size="sm" c="dimmed" lineClamp={2}>
                                                        {quiz.description}
                                                    </Text>
                                                </div>
                                                <Badge color="blue" variant="light" size="sm">
                                                    Disponible
                                                </Badge>
                                            </Group>

                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="sm" fw={500}>
                                                        {quiz.subject}
                                                    </Text>
                                                    <Badge
                                                        color={getDifficultyColor(quiz.difficulty)}
                                                        variant="light"
                                                        size="sm"
                                                    >
                                                        {quiz.difficulty}
                                                    </Badge>
                                                </Group>

                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">
                                                        {quiz.questionsCount} questions
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {quiz.duration} min
                                                    </Text>
                                                </Group>

                                                {quiz.dueDate && (
                                                    <Group gap="xs">
                                                        <IconCalendar size={14} />
                                                        <Text size="sm" c="dimmed">
                                                            Échéance: {formatDate(quiz.dueDate)}
                                                        </Text>
                                                    </Group>
                                                )}
                                            </Stack>

                                            <Group justify="space-between" mt="auto">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    leftSection={<IconEye size={16} />}
                                                    onClick={() => handleViewDetails(quiz)}
                                                >
                                                    Détails
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    leftSection={<IconPlayerPlay size={16} />}
                                                    onClick={() => handleStartQuiz(quiz)}
                                                >
                                                    Commencer
                                                </Button>
                                            </Group>
                                        </Stack>
                                    </Card>
                                ))}
                        </SimpleGrid>
                    </Tabs.Panel>

                    <Tabs.Panel value="completed" pt="md">
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                            {mockQuizzes
                                .filter(q => q.status === 'completed')
                                .map((quiz) => (
                                    <Card key={quiz.id} withBorder p="lg" radius="md" h="100%">
                                        <Stack gap="md" h="100%">
                                            <Group justify="space-between" align="flex-start">
                                                <div style={{ flex: 1 }}>
                                                    <Title order={3} size="h4" mb="xs">
                                                        {quiz.title}
                                                    </Title>
                                                    <Text size="sm" c="dimmed" lineClamp={2}>
                                                        {quiz.description}
                                                    </Text>
                                                </div>
                                                <Badge color="green" variant="light" size="sm">
                                                    Terminé
                                                </Badge>
                                            </Group>

                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="sm" fw={500}>
                                                        {quiz.subject}
                                                    </Text>
                                                    <Badge
                                                        color={getDifficultyColor(quiz.difficulty)}
                                                        variant="light"
                                                        size="sm"
                                                    >
                                                        {quiz.difficulty}
                                                    </Badge>
                                                </Group>

                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">
                                                        {quiz.questionsCount} questions
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {quiz.duration} min
                                                    </Text>
                                                </Group>

                                                {quiz.attempts > 0 && (
                                                    <Group gap="xs">
                                                        <IconUsers size={14} />
                                                        <Text size="sm" c="dimmed">
                                                            {quiz.attempts}/{quiz.maxAttempts} tentatives
                                                        </Text>
                                                    </Group>
                                                )}
                                            </Stack>

                                            {quiz.statistics && (
                                                <Paper p="sm" radius="md" bg="gray.0">
                                                    <Stack gap="xs">
                                                        <Group justify="space-between">
                                                            <Text size="xs" c="dimmed">
                                                                Score moyen
                                                            </Text>
                                                            <Text size="sm" fw={600}>
                                                                {quiz.statistics.averageScore}%
                                                            </Text>
                                                        </Group>
                                                        <Group justify="space-between">
                                                            <Text size="xs" c="dimmed">
                                                                Taux de réussite
                                                            </Text>
                                                            <Text size="sm" fw={600}>
                                                                {quiz.statistics.completionRate}%
                                                            </Text>
                                                        </Group>
                                                    </Stack>
                                                </Paper>
                                            )}

                                            <Group justify="space-between" mt="auto">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    leftSection={<IconEye size={16} />}
                                                    onClick={() => handleViewDetails(quiz)}
                                                >
                                                    Détails
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    leftSection={<IconChartBar size={16} />}
                                                    onClick={() => handleViewDetails(quiz)}
                                                >
                                                    Résultats
                                                </Button>
                                            </Group>
                                        </Stack>
                                    </Card>
                                ))}
                        </SimpleGrid>
                    </Tabs.Panel>

                    <Tabs.Panel value="expired" pt="md">
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                            {mockQuizzes
                                .filter(q => q.status === 'expired')
                                .map((quiz) => (
                                    <Card key={quiz.id} withBorder p="lg" radius="md" h="100%" opacity={0.7}>
                                        <Stack gap="md" h="100%">
                                            <Group justify="space-between" align="flex-start">
                                                <div style={{ flex: 1 }}>
                                                    <Title order={3} size="h4" mb="xs">
                                                        {quiz.title}
                                                    </Title>
                                                    <Text size="sm" c="dimmed" lineClamp={2}>
                                                        {quiz.description}
                                                    </Text>
                                                </div>
                                                <Badge color="red" variant="light" size="sm">
                                                    Expiré
                                                </Badge>
                                            </Group>

                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="sm" fw={500}>
                                                        {quiz.subject}
                                                    </Text>
                                                    <Badge
                                                        color={getDifficultyColor(quiz.difficulty)}
                                                        variant="light"
                                                        size="sm"
                                                    >
                                                        {quiz.difficulty}
                                                    </Badge>
                                                </Group>

                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">
                                                        {quiz.questionsCount} questions
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {quiz.duration} min
                                                    </Text>
                                                </Group>

                                                {quiz.dueDate && (
                                                    <Group gap="xs">
                                                        <IconCalendar size={14} />
                                                        <Text size="sm" c="dimmed">
                                                            Échéance: {formatDate(quiz.dueDate)}
                                                        </Text>
                                                    </Group>
                                                )}
                                            </Stack>

                                            <Group justify="space-between" mt="auto">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    leftSection={<IconEye size={16} />}
                                                    onClick={() => handleViewDetails(quiz)}
                                                >
                                                    Détails
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    leftSection={<IconChartBar size={16} />}
                                                    onClick={() => handleViewDetails(quiz)}
                                                    disabled
                                                >
                                                    Résultats
                                                </Button>
                                            </Group>
                                        </Stack>
                                    </Card>
                                ))}
                        </SimpleGrid>
                    </Tabs.Panel>
                </Tabs>

                {/* Modal de détails du quiz */}
                <Modal
                    opened={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    title={selectedQuiz?.title}
                    size="lg"
                >
                    {selectedQuiz && (
                        <Stack gap="md">
                            <Text size="sm" c="dimmed">
                                {selectedQuiz.description}
                            </Text>

                            <Divider />

                            <SimpleGrid cols={2} spacing="md">
                                <div>
                                    <Text size="sm" fw={600} mb="xs">
                                        Informations générales
                                    </Text>
                                    <Stack gap="xs">
                                        <Group justify="space-between">
                                            <Text size="sm">Matière:</Text>
                                            <Text size="sm" fw={500}>{selectedQuiz.subject}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm">Difficulté:</Text>
                                            <Badge
                                                color={getDifficultyColor(selectedQuiz.difficulty)}
                                                variant="light"
                                                size="sm"
                                            >
                                                {selectedQuiz.difficulty}
                                            </Badge>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm">Questions:</Text>
                                            <Text size="sm" fw={500}>{selectedQuiz.questionsCount}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm">Durée:</Text>
                                            <Text size="sm" fw={500}>{selectedQuiz.duration} min</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm">Score max:</Text>
                                            <Text size="sm" fw={500}>{selectedQuiz.maxScore}</Text>
                                        </Group>
                                    </Stack>
                                </div>

                                <div>
                                    <Text size="sm" fw={600} mb="xs">
                                        Paramètres
                                    </Text>
                                    <Stack gap="xs">
                                        <Group justify="space-between">
                                            <Text size="sm">Tentatives:</Text>
                                            <Text size="sm" fw={500}>
                                                {selectedQuiz.attempts}/{selectedQuiz.maxAttempts}
                                            </Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm">Chronométré:</Text>
                                            <Text size="sm" fw={500}>
                                                {selectedQuiz.isTimed ? 'Oui' : 'Non'}
                                            </Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm">Nouvelle tentative:</Text>
                                            <Text size="sm" fw={500}>
                                                {selectedQuiz.allowRetake ? 'Oui' : 'Non'}
                                            </Text>
                                        </Group>
                                        {selectedQuiz.dueDate && (
                                            <Group justify="space-between">
                                                <Text size="sm">Échéance:</Text>
                                                <Text size="sm" fw={500}>
                                                    {formatDate(selectedQuiz.dueDate)}
                                                </Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </div>
                            </SimpleGrid>

                            {selectedQuiz.instructions && (
                                <>
                                    <Divider />
                                    <div>
                                        <Text size="sm" fw={600} mb="xs">
                                            Instructions
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {selectedQuiz.instructions}
                                        </Text>
                                    </div>
                                </>
                            )}

                            {selectedQuiz.tags.length > 0 && (
                                <>
                                    <Divider />
                                    <div>
                                        <Text size="sm" fw={600} mb="xs">
                                            Tags
                                        </Text>
                                        <Group gap="xs">
                                            {selectedQuiz.tags.map((tag, index) => (
                                                <Badge key={index} variant="light" size="sm">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </div>
                                </>
                            )}

                            {selectedQuiz.statistics && (
                                <>
                                    <Divider />
                                    <div>
                                        <Text size="sm" fw={600} mb="xs">
                                            Statistiques
                                        </Text>
                                        <SimpleGrid cols={2} spacing="md">
                                            <div>
                                                <Text size="sm" c="dimmed">Score moyen</Text>
                                                <Text size="lg" fw={700} c="violet">
                                                    {selectedQuiz.statistics.averageScore}%
                                                </Text>
                                            </div>
                                            <div>
                                                <Text size="sm" c="dimmed">Taux de réussite</Text>
                                                <Text size="lg" fw={700} c="green">
                                                    {selectedQuiz.statistics.completionRate}%
                                                </Text>
                                            </div>
                                            <div>
                                                <Text size="sm" c="dimmed">Total tentatives</Text>
                                                <Text size="lg" fw={700} c="blue">
                                                    {selectedQuiz.statistics.totalAttempts}
                                                </Text>
                                            </div>
                                            <div>
                                                <Text size="sm" c="dimmed">Meilleur score</Text>
                                                <Text size="lg" fw={700} c="orange">
                                                    {selectedQuiz.statistics.bestScore}%
                                                </Text>
                                            </div>
                                        </SimpleGrid>
                                    </div>
                                </>
                            )}

                            <Group justify="flex-end" mt="md">
                                <Button
                                    variant="light"
                                    onClick={() => setIsDetailsModalOpen(false)}
                                >
                                    Fermer
                                </Button>
                                {selectedQuiz.status === 'published' && selectedQuiz.attempts < selectedQuiz.maxAttempts && (
                                    <Button
                                        leftSection={<IconPlayerPlay size={16} />}
                                        onClick={() => {
                                            setIsDetailsModalOpen(false);
                                            handleStartQuiz(selectedQuiz);
                                        }}
                                    >
                                        Commencer le quiz
                                    </Button>
                                )}
                            </Group>
                        </Stack>
                    )}
                </Modal>

                {/* Modal de création de quiz */}
                <Modal
                    opened={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Créer un nouveau quiz"
                    size="lg"
                >
                    <Stack gap="md">
                        <TextInput
                            label="Titre du quiz"
                            placeholder="Entrez le titre du quiz"
                            required
                        />
                        <Textarea
                            label="Description"
                            placeholder="Décrivez le contenu du quiz"
                            rows={3}
                        />
                        <Select
                            label="Matière"
                            placeholder="Sélectionnez une matière"
                            data={['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie']}
                            required
                        />
                        <Select
                            label="Difficulté"
                            placeholder="Sélectionnez la difficulté"
                            data={[
                                { value: 'facile', label: 'Facile' },
                                { value: 'moyen', label: 'Moyen' },
                                { value: 'difficile', label: 'Difficile' }
                            ]}
                            required
                        />
                        <NumberInput
                            label="Nombre de questions"
                            placeholder="Entrez le nombre de questions"
                            min={1}
                            max={100}
                            required
                        />
                        <NumberInput
                            label="Durée (minutes)"
                            placeholder="Entrez la durée en minutes"
                            min={1}
                            max={300}
                            required
                        />
                        <NumberInput
                            label="Score maximum"
                            placeholder="Entrez le score maximum"
                            min={1}
                            max={1000}
                            required
                        />
                        <NumberInput
                            label="Nombre maximum de tentatives"
                            placeholder="Entrez le nombre maximum de tentatives"
                            min={1}
                            max={10}
                            required
                        />
                        <Switch
                            label="Quiz chronométré"
                            description="Le quiz aura une limite de temps"
                        />
                        <Switch
                            label="Permettre de refaire le quiz"
                            description="Les étudiants peuvent refaire le quiz plusieurs fois"
                        />
                        <TextInput
                            label="Date d'échéance"
                            type="datetime-local"
                            placeholder="Sélectionnez la date d'échéance"
                        />
                        <Textarea
                            label="Instructions"
                            placeholder="Instructions spéciales pour les étudiants"
                            rows={3}
                        />
                        <TextInput
                            label="Tags (séparés par des virgules)"
                            placeholder="ex: algèbre, matrices, déterminants"
                        />

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="light"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    // Ici, vous pourriez sauvegarder le quiz
                                }}
                            >
                                Créer le quiz
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Stack>
        </MainLayout>
    );
};

export default QuizzesPage;
