import React, { useState } from 'react';
import {
    Title,
    Stack,
    Card,
    Text,
    Group,
    Badge,
    Button,
    Paper,
    Grid,
    ThemeIcon,
    Box,
    Center,
    Loader,
    SimpleGrid,
    ScrollArea,
} from '@mantine/core';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    IconCalendar,
    IconChartLine,
    IconTrendingUp,
    IconTrendingDown,
    IconMinus,
    IconBook,
    IconTrophy,
    IconClock
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

// Types pour les données de session
interface Exam {
    id: string;
    title: string;
    date: string;
    type: 'exam' | 'quiz' | 'project' | 'presentation';
    maxPoints: number;
    studentGrade?: number;
    classAverage?: number;
    weight: number; // Poids dans la note finale (en %)
    status: 'upcoming' | 'completed' | 'graded';
    subject: string;
    teacherNote?: string; // Note du professeur
}

interface Subject {
    id: string;
    name: string;
    code: string;
    teacher: {
        name: string;
        avatar: string;
    };
    currentGrade: number; // Note actuelle sur 100
    classAverage: number; // Moyenne de classe sur 100
    credits: number;
    exams: Exam[];
    color: string;
}

// Données placeholder
const mockSubjects: Subject[] = [
    {
        id: '1',
        name: 'Mathématiques Avancées',
        code: 'MATH-301',
        teacher: {
            name: 'Prof. Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        currentGrade: 87.5,
        classAverage: 82.3,
        credits: 4,
        color: 'blue',
        exams: [
            {
                id: '1',
                title: 'Examen de mi-session',
                date: '2024-12-15T09:00:00',
                type: 'exam',
                maxPoints: 100,
                studentGrade: 85,
                classAverage: 78.5,
                weight: 30,
                status: 'graded',
                subject: 'Mathématiques Avancées',
                teacherNote: 'Excellent travail ! Tes démonstrations sont claires et bien structurées. Continue comme ça !'
            },
            {
                id: '2',
                title: 'Quiz - Algèbre linéaire',
                date: '2024-12-20T14:00:00',
                type: 'quiz',
                maxPoints: 50,
                studentGrade: 48,
                classAverage: 42.3,
                weight: 10,
                status: 'graded',
                subject: 'Mathématiques Avancées',
                teacherNote: 'Très bon résultat ! Fais attention à la ponctuation dans tes réponses et vérifie tes calculs intermédiaires.'
            },
            {
                id: '3',
                title: 'Examen final',
                date: '2025-01-15T09:00:00',
                type: 'exam',
                maxPoints: 100,
                weight: 40,
                status: 'upcoming',
                subject: 'Mathématiques Avancées'
            },
            {
                id: '4',
                title: 'Projet de recherche',
                date: '2025-01-20T23:59:00',
                type: 'project',
                maxPoints: 80,
                weight: 20,
                status: 'upcoming',
                subject: 'Mathématiques Avancées'
            }
        ]
    },
    {
        id: '2',
        name: 'Physique Quantique',
        code: 'PHYS-401',
        teacher: {
            name: 'Dr. Moreau',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        currentGrade: 92.1,
        classAverage: 85.7,
        credits: 3,
        color: 'green',
        exams: [
            {
                id: '5',
                title: 'Examen de mécanique quantique',
                date: '2024-12-18T10:00:00',
                type: 'exam',
                maxPoints: 100,
                studentGrade: 94,
                classAverage: 87.2,
                weight: 35,
                status: 'graded',
                subject: 'Physique Quantique',
                teacherNote: 'Performance exceptionnelle ! Ta compréhension des concepts quantiques est remarquable. Bravo !'
            },
            {
                id: '6',
                title: 'Présentation - Applications',
                date: '2025-01-10T14:00:00',
                type: 'presentation',
                maxPoints: 60,
                weight: 25,
                status: 'upcoming',
                subject: 'Physique Quantique'
            },
            {
                id: '7',
                title: 'Examen final',
                date: '2025-01-18T09:00:00',
                type: 'exam',
                maxPoints: 100,
                weight: 40,
                status: 'upcoming',
                subject: 'Physique Quantique'
            }
        ]
    },
    {
        id: '3',
        name: 'Informatique - Algorithmes',
        code: 'INFO-301',
        teacher: {
            name: 'M. Garcia',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        currentGrade: 78.9,
        classAverage: 81.2,
        credits: 4,
        color: 'orange',
        exams: [
            {
                id: '8',
                title: 'Projet de programmation',
                date: '2024-12-12T23:59:00',
                type: 'project',
                maxPoints: 100,
                studentGrade: 82,
                classAverage: 85.1,
                weight: 30,
                status: 'graded',
                subject: 'Informatique - Algorithmes',
                teacherNote: 'Bon travail sur l\'algorithme ! Améliore la documentation de ton code et optimise la complexité temporelle.'
            },
            {
                id: '9',
                title: 'Quiz - Structures de données',
                date: '2024-12-25T16:00:00',
                type: 'quiz',
                maxPoints: 40,
                studentGrade: 35,
                classAverage: 38.7,
                weight: 15,
                status: 'graded',
                subject: 'Informatique - Algorithmes',
                teacherNote: 'Révise les concepts de base des arbres binaires et des listes chaînées. N\'hésite pas à venir aux heures de bureau !'
            },
            {
                id: '10',
                title: 'Examen final',
                date: '2025-01-22T14:00:00',
                type: 'exam',
                maxPoints: 100,
                weight: 40,
                status: 'upcoming',
                subject: 'Informatique - Algorithmes'
            },
            {
                id: '11',
                title: 'Présentation - Projet final',
                date: '2025-01-25T10:00:00',
                type: 'presentation',
                maxPoints: 50,
                weight: 15,
                status: 'upcoming',
                subject: 'Informatique - Algorithmes'
            }
        ]
    }
];

const MySessionPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [activeExamTab, setActiveExamTab] = useState<'upcoming' | 'completed'>('upcoming');

    if (!user) {
        return (
            <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    const handleAddToCalendar = (exam: Exam) => {
        console.log('Ajout à l\'agenda:', exam);
    };

    const handleSubjectClick = (subjectId: string) => {
        if (selectedSubject === subjectId) {
            setSelectedSubject(null);
        } else {
            setSelectedSubject(subjectId);
            setActiveExamTab('upcoming'); // Réinitialiser à l'onglet "À venir" quand on change de matière
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'green';
        if (grade >= 80) return 'blue';
        if (grade >= 70) return 'yellow';
        return 'red';
    };

    const getGradeIcon = (studentGrade: number, classAverage: number) => {
        if (studentGrade > classAverage) return <IconTrendingUp size={16} color="green" />;
        if (studentGrade < classAverage) return <IconTrendingDown size={16} color="red" />;
        return <IconMinus size={16} color="gray" />;
    };

    const getExamTypeColor = (type: string) => {
        switch (type) {
            case 'exam': return 'red';
            case 'quiz': return 'blue';
            case 'project': return 'green';
            case 'presentation': return 'orange';
            default: return 'gray';
        }
    };

    const getExamTypeLabel = (type: string) => {
        switch (type) {
            case 'exam': return 'Examen';
            case 'quiz': return 'Quiz';
            case 'project': return 'Projet';
            case 'presentation': return 'Présentation';
            default: return 'Autre';
        }
    };

    const filteredSubjects = selectedSubject
        ? mockSubjects.filter(s => s.id === selectedSubject)
        : mockSubjects;

    // Préparer les données pour le graphique par matière
    const prepareChartData = (subjectId?: string) => {
        const subjectsToProcess = subjectId
            ? mockSubjects.filter(s => s.id === subjectId)
            : mockSubjects;

        const allExams = subjectsToProcess
            .flatMap(subject =>
                subject.exams
                    .filter(exam => exam.status === 'graded')
                    .map(exam => ({
                        ...exam,
                        subjectName: subject.name,
                        subjectColor: subject.color
                    }))
            )
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return allExams.map((exam, index) => ({
            name: exam.title,
            date: new Date(exam.date),
            fullDate: new Date(exam.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            note: exam.studentGrade,
            classAverage: exam.classAverage,
            subject: exam.subjectName,
            type: getExamTypeLabel(exam.type),
            maxPoints: exam.maxPoints
        }));
    };

    const chartData = prepareChartData(selectedSubject || undefined);

    return (
        <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
            <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* En-tête harmonisé avec les autres pages */}
                <Box style={{ flexShrink: 0 }}>
                    <Group justify="space-between" align="center" mb="md">
                        <Group>
                            <ThemeIcon size={40} radius="md" color="violet">
                                <IconCalendar size={24} />
                            </ThemeIcon>
                            <div>
                                <Title order={1} size="h2">
                                    Ma Session
                                </Title>
                                <Text c="dimmed" size="sm">
                                    Suivez vos examens et votre progression académique
                                </Text>
                            </div>
                        </Group>
                        <Group gap="md">
                            <Group gap="xs">
                                <ThemeIcon size="sm" color="violet" variant="light" radius="md">
                                    <IconChartLine size={12} />
                                </ThemeIcon>
                                <Text size="sm" c="dimmed" fw={500}>
                                    Session d'automne 2024
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <ThemeIcon size="sm" color="blue" variant="light" radius="md">
                                    <IconBook size={12} />
                                </ThemeIcon>
                                <Text size="sm" c="dimmed" fw={500}>
                                    {mockSubjects.length} matières
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <ThemeIcon size="sm" color="green" variant="light" radius="md">
                                    <IconTrophy size={12} />
                                </ThemeIcon>
                                <Text size="sm" c="dimmed" fw={500}>
                                    {mockSubjects.reduce((acc, s) => acc + s.exams.filter(e => e.status === 'graded').length, 0)} examens notés
                                </Text>
                            </Group>
                        </Group>
                    </Group>
                </Box>

                {/* Contenu principal avec scroll */}
                <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                    <Box p="xs">
                        <Stack gap="xl">
                            {/* Vue d'ensemble des matières */}
                            <Box>
                                <Title order={3} size="h4" mb="lg" c="dark">
                                    Vue d'ensemble des matières
                                </Title>
                                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                                    {mockSubjects.map((subject) => (
                                        <Card
                                            key={subject.id}
                                            p="lg"
                                            radius="md"
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedSubject === subject.id
                                                    ? '2px solid var(--mantine-color-violet-4)'
                                                    : '1px solid var(--mantine-color-gray-2)',
                                                backgroundColor: selectedSubject === subject.id
                                                    ? 'var(--mantine-color-violet-0)'
                                                    : 'white',
                                                boxShadow: selectedSubject === subject.id
                                                    ? '0 8px 20px rgba(139, 69, 255, 0.15)'
                                                    : '0 4px 12px rgba(0, 0, 0, 0.08)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => handleSubjectClick(subject.id)}
                                            onMouseEnter={(e) => {
                                                if (selectedSubject !== subject.id) {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-violet-3)';
                                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 69, 255, 0.1)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedSubject !== subject.id) {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-gray-2)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                                }
                                            }}
                                        >
                                            <Stack gap="md">
                                                <div>
                                                    <Text fw={700} size="lg" c="dark" mb="xs">
                                                        {subject.name}
                                                    </Text>
                                                    <Group gap="md" align="center">
                                                        <Badge
                                                            color="violet"
                                                            variant="light"
                                                            size="sm"
                                                            radius="md"
                                                            style={{ fontWeight: 600 }}
                                                        >
                                                            {subject.code}
                                                        </Badge>
                                                        <Text size="sm" c="dimmed" fw={500}>
                                                            {subject.credits} crédits
                                                        </Text>
                                                    </Group>
                                                </div>

                                                <Box
                                                    p="md"
                                                    style={{
                                                        backgroundColor: 'var(--mantine-color-gray-0)',
                                                        borderRadius: '12px',
                                                        border: '1px solid var(--mantine-color-gray-2)'
                                                    }}
                                                >
                                                    <Group justify="space-between" align="center" mb="sm">
                                                        <Text size="sm" c="dimmed" fw={600}>Votre note</Text>
                                                        <Group gap="xs">
                                                            <Text fw={700} size="xl" c={getGradeColor(subject.currentGrade)}>
                                                                {subject.currentGrade.toFixed(1)}%
                                                            </Text>
                                                            {getGradeIcon(subject.currentGrade, subject.classAverage)}
                                                        </Group>
                                                    </Group>

                                                    <Group justify="space-between" align="center">
                                                        <Text size="sm" c="dimmed" fw={500}>Moyenne classe</Text>
                                                        <Text fw={600} c="dimmed">
                                                            {subject.classAverage.toFixed(1)}%
                                                        </Text>
                                                    </Group>
                                                </Box>

                                                <Group justify="space-between" align="center">
                                                    <Group gap="xs">
                                                        <ThemeIcon size="sm" color="green" variant="light" radius="md">
                                                            <IconTrophy size={12} />
                                                        </ThemeIcon>
                                                        <Text size="xs" c="dimmed" fw={500}>
                                                            {subject.exams.filter(e => e.status === 'graded').length} notés
                                                        </Text>
                                                    </Group>
                                                    <Group gap="xs">
                                                        <ThemeIcon size="sm" color="blue" variant="light" radius="md">
                                                            <IconClock size={12} />
                                                        </ThemeIcon>
                                                        <Text size="xs" c="dimmed" fw={500}>
                                                            {subject.exams.filter(e => e.status === 'upcoming').length} à venir
                                                        </Text>
                                                    </Group>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            </Box>

                            {/* Détail des examens et graphique côte à côte */}
                            <Grid>
                                <Grid.Col span={6}>
                                    {/* Détail des examens */}
                                    {selectedSubject ? (
                                        <Box>
                                            <Title order={3} size="h4" mb="lg" c="dark">
                                                Détail des examens - {mockSubjects.find(s => s.id === selectedSubject)?.name}
                                            </Title>

                                            <Box
                                                p="md"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--mantine-color-gray-2)'
                                                }}
                                            >
                                                <Group gap="xs">
                                                    <Button
                                                        variant={activeExamTab === 'upcoming' ? "filled" : "subtle"}
                                                        color="violet"
                                                        size="sm"
                                                        radius="md"
                                                        leftSection={<IconClock size={16} />}
                                                        style={{ fontWeight: 600 }}
                                                        onClick={() => setActiveExamTab('upcoming')}
                                                    >
                                                        À venir ({mockSubjects.find(s => s.id === selectedSubject)?.exams.filter(e => e.status === 'upcoming').length || 0})
                                                    </Button>
                                                    <Button
                                                        variant={activeExamTab === 'completed' ? "filled" : "subtle"}
                                                        color="violet"
                                                        size="sm"
                                                        radius="md"
                                                        leftSection={<IconTrophy size={16} />}
                                                        style={{ fontWeight: 600 }}
                                                        onClick={() => setActiveExamTab('completed')}
                                                    >
                                                        Terminés ({mockSubjects.find(s => s.id === selectedSubject)?.exams.filter(e => e.status === 'graded').length || 0})
                                                    </Button>
                                                </Group>
                                            </Box>

                                            <Card p="lg" radius="md" withBorder style={{ marginTop: '16px' }}>
                                                <SimpleGrid cols={1} spacing="md">
                                                    {mockSubjects
                                                        .find(s => s.id === selectedSubject)
                                                        ?.exams.filter(exam =>
                                                            activeExamTab === 'upcoming' ? exam.status === 'upcoming' : exam.status === 'graded'
                                                        )
                                                        .map((exam, index) => (
                                                            <Paper key={index} p="md" radius="md" withBorder>
                                                                <Stack gap="xs">
                                                                    <Group justify="space-between" align="center">
                                                                        <Group justify='flex-start'>
                                                                            <Stack gap="xs">
                                                                                <Text fw={600} size="sm" c="dark">
                                                                                    {exam.title}
                                                                                </Text>
                                                                                <Text size="xs" c="dimmed">
                                                                                    {new Date(exam.date).toLocaleDateString('fr-FR', {
                                                                                        weekday: 'long',
                                                                                        day: 'numeric',
                                                                                        month: 'long',
                                                                                        year: 'numeric'
                                                                                    })}
                                                                                </Text>
                                                                            </Stack>
                                                                        </Group>
                                                                        <Group justify='flex-end'>
                                                                            <Stack gap="xs">
                                                                                <Badge
                                                                                    color={exam.status === 'graded' ? 'green' : 'orange'}
                                                                                    variant="light"
                                                                                    size="sm"
                                                                                >
                                                                                    {exam.status === 'graded' ? 'Noté' : 'En attente'}
                                                                                </Badge>
                                                                                {exam.status === 'upcoming' && (
                                                                                    <Button variant="light" color="violet" size="xs" radius="md">Ajouter à l'agenda</Button>
                                                                                )}
                                                                            </Stack>
                                                                        </Group>
                                                                    </Group>

                                                                    {exam.status === 'graded' && (
                                                                        <Group gap="xs" align="center">
                                                                            <Text size="sm" c="dark">
                                                                                Votre note:
                                                                            </Text>
                                                                            <Text fw={700} size="lg" c="violet">
                                                                                {exam.studentGrade}%
                                                                            </Text>
                                                                            <Text size="xs" c="dimmed">
                                                                                / {exam.classAverage}%
                                                                            </Text>
                                                                        </Group>
                                                                    )}
                                                                    {exam.teacherNote && (
                                                                        <Text size="xs" c="dimmed" lineClamp={2} bg="var(--mantine-color-gray-0)" p="md">
                                                                            {exam.teacherNote}
                                                                        </Text>
                                                                    )}
                                                                </Stack>
                                                            </Paper>
                                                        ))}
                                                </SimpleGrid>
                                            </Card>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Title order={3} size="h4" mb="lg" c="dark">
                                                Détail des examens
                                            </Title>
                                            <Card p="lg" radius="md" withBorder>
                                                <Center py="xl">
                                                    <Stack align="center" gap="md">
                                                        <ThemeIcon size="xl" radius="md" variant="light" color="gray">
                                                            <IconBook size={32} />
                                                        </ThemeIcon>
                                                        <Text size="md" c="dimmed" ta="center">
                                                            Sélectionnez une matière pour voir le détail des examens
                                                        </Text>
                                                    </Stack>
                                                </Center>
                                            </Card>
                                        </Box>
                                    )}
                                </Grid.Col>

                                <Grid.Col span={6}>
                                    <Title order={3} size="h4" mb="lg" c="dark">
                                        Évolution des notes d'examens passés
                                    </Title>
                                    <Card p="lg" radius="md" withBorder>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-3)" />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="var(--mantine-color-gray-6)"
                                                    fontSize={12}
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return date.toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short'
                                                        });
                                                    }}
                                                />
                                                <YAxis
                                                    stroke="var(--mantine-color-gray-6)"
                                                    fontSize={12}
                                                    domain={[0, 100]}
                                                    tickFormatter={(value) => `${value}%`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid var(--mantine-color-gray-2)',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    labelFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return date.toLocaleDateString('fr-FR', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        });
                                                    }}
                                                    formatter={(value, name) => [
                                                        `${value}%`,
                                                        name === 'note' ? 'Votre note' : 'Moyenne classe'
                                                    ]}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="note"
                                                    stroke="var(--mantine-color-violet-6)"
                                                    strokeWidth={3}
                                                    dot={{ fill: 'var(--mantine-color-violet-6)', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, stroke: 'var(--mantine-color-violet-6)', strokeWidth: 2 }}
                                                    name="Votre note"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="classAverage"
                                                    stroke="var(--mantine-color-blue-6)"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    dot={{ fill: 'var(--mantine-color-blue-6)', strokeWidth: 2, r: 3 }}
                                                    activeDot={{ r: 5, stroke: 'var(--mantine-color-blue-6)', strokeWidth: 2 }}
                                                    name="Moyenne classe"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </Grid.Col>
                            </Grid>

                        </Stack>
                    </Box>
                </ScrollArea>
            </Box>
        </MainLayout>
    );
};

export default MySessionPage;
