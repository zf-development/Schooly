import React, { useState } from 'react';
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
    Grid,
    ThemeIcon,
    ActionIcon,
    Progress,
    Box,
    Center,
    Loader,
    SimpleGrid,
    Divider,
    Tabs,
    Table,
    ScrollArea
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
    IconCalendarPlus,
    IconChartLine,
    IconTrendingUp,
    IconTrendingDown,
    IconMinus,
    IconBook,
    IconTrophy,
    IconClock,
    IconUsers,
    IconTarget,
    IconX
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
                subject: 'Mathématiques Avancées'
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
                subject: 'Mathématiques Avancées'
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
                subject: 'Physique Quantique'
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
                subject: 'Informatique - Algorithmes'
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
                subject: 'Informatique - Algorithmes'
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

    const handleAddToCalendar = (exam: Exam) => {
        console.log('Ajout à l\'agenda:', exam);
    };

    const handleSubjectClick = (subjectId: string) => {
        if (selectedSubject === subjectId) {
            setSelectedSubject(null);
        } else {
            setSelectedSubject(subjectId);
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
            date: new Date(exam.date).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit' 
            }),
            fullDate: new Date(exam.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            studentGrade: exam.studentGrade,
            classAverage: exam.classAverage,
            subject: exam.subjectName,
            type: getExamTypeLabel(exam.type),
            maxPoints: exam.maxPoints
        }));
    };

    const chartData = prepareChartData(selectedSubject || undefined);

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconChartLine size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Ma session
                            </Title>
                            <Text c="dimmed" size="sm">
                                Session d'automne 2024 - Suivi des performances
                            </Text>
                        </div>
                    </Group>
                </Group>

                <Stack gap="xl">

                    {/* Vue d'ensemble des matières */}
                    <Paper withBorder p="lg" radius="md">
                        <Title order={2} size="h3" mb="lg">
                            Vue d'ensemble des matières
                        </Title>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                            {mockSubjects.map((subject) => (
                                <Card 
                                    key={subject.id}
                                    withBorder 
                                    p="md" 
                                    radius="md"
                                    style={{ 
                                        cursor: 'pointer',
                                        borderColor: selectedSubject === subject.id ? 'var(--mantine-color-blue-6)' : undefined,
                                        borderWidth: selectedSubject === subject.id ? 2 : 1,
                                        backgroundColor: selectedSubject === subject.id ? 'var(--mantine-color-blue-0)' : undefined
                                    }}
                                    onClick={() => handleSubjectClick(subject.id)}
                                >
                                    <Stack gap="sm">
                                        <div>
                                            <Text fw={600} size="lg">{subject.name}</Text>
                                            <Group gap="xs" align="center">
                                                <Text size="sm" c="dimmed">{subject.code}</Text>
                                                <Text size="sm" c="dimmed">•</Text>
                                                <Text size="sm" c="dimmed">{subject.credits} crédits</Text>
                                            </Group>
                                        </div>

                                        <Group justify="space-between" align="center">
                                            <Text size="sm" c="dimmed">Votre note</Text>
                                            <Group gap="xs">
                                                <Text fw={600} size="lg" c={getGradeColor(subject.currentGrade)}>
                                                    {subject.currentGrade.toFixed(1)}%
                                                </Text>
                                                {getGradeIcon(subject.currentGrade, subject.classAverage)}
                                            </Group>
                                        </Group>

                                        <Group justify="space-between" align="center">
                                            <Text size="sm" c="dimmed">Moyenne classe</Text>
                                            <Text fw={500} c="dimmed">
                                                {subject.classAverage.toFixed(1)}%
                                            </Text>
                                        </Group>

                                        <Group justify="space-between" align="center">
                                            <Text size="xs" c="dimmed">
                                                {subject.exams.filter(e => e.status === 'graded').length} examens notés
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {subject.exams.filter(e => e.status === 'upcoming').length} à venir
                                            </Text>
                                        </Group>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </Paper>

                    {/* Détail des examens */}
                    {selectedSubject && (
                        <Paper withBorder p="lg" radius="md">
                            <Title order={2} size="h3" mb="lg">
                                Détail des examens - {mockSubjects.find(s => s.id === selectedSubject)?.name}
                            </Title>

                            <Tabs defaultValue="upcoming">
                                <Tabs.List>
                                    <Tabs.Tab value="upcoming" leftSection={<IconClock size={16} />}>
                                        À venir ({mockSubjects.find(s => s.id === selectedSubject)?.exams.filter(e => e.status === 'upcoming').length || 0})
                                    </Tabs.Tab>
                                    <Tabs.Tab value="completed" leftSection={<IconTrophy size={16} />}>
                                        Terminés ({mockSubjects.find(s => s.id === selectedSubject)?.exams.filter(e => e.status === 'graded').length || 0})
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="upcoming" pt="md">
                                    <Stack gap="md">
                                        {mockSubjects.find(s => s.id === selectedSubject)?.exams
                                            .filter(e => e.status === 'upcoming')
                                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                            .map((exam) => (
                                                <Card key={exam.id} withBorder p="md" radius="md">
                                                    <Group justify="space-between" align="flex-start">
                                                        <div style={{ flex: 1 }}>
                                                            <Group gap="sm" mb="xs">
                                                                <Text fw={600} size="lg">{exam.title}</Text>
                                                                <Badge color={getExamTypeColor(exam.type)} variant="light">
                                                                    {getExamTypeLabel(exam.type)}
                                                                </Badge>
                                                                <Badge color="blue" variant="outline">
                                                                    {exam.weight}% de la note finale
                                                                </Badge>
                                                            </Group>
                                                            
                                                            <Group gap="lg" mb="sm">
                                                                <Group gap="xs">
                                                                    <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                                                                    <Text size="sm">{formatDate(exam.date)}</Text>
                                                                </Group>
                                                                <Group gap="xs">
                                                                    <IconTarget size={16} color="var(--mantine-color-gray-6)" />
                                                                    <Text size="sm">{exam.maxPoints} points</Text>
                                                                </Group>
                                                            </Group>
                                                        </div>
                                                        
                                                        <Button
                                                            leftSection={<IconCalendarPlus size={16} />}
                                                            variant="outline"
                                                            color="green"
                                                            onClick={() => handleAddToCalendar(exam)}
                                                        >
                                                            Ajouter à l'agenda
                                                        </Button>
                                                    </Group>
                                                </Card>
                                            ))}
                                        
                                        {mockSubjects.find(s => s.id === selectedSubject)?.exams.filter(e => e.status === 'upcoming').length === 0 && (
                                            <Center py="xl">
                                                <Text c="dimmed">Aucun examen à venir</Text>
                                            </Center>
                                        )}
                                    </Stack>
                                </Tabs.Panel>

                                <Tabs.Panel value="completed" pt="md">
                                    <Stack gap="md">
                                        {mockSubjects.find(s => s.id === selectedSubject)?.exams
                                            .filter(e => e.status === 'graded')
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((exam) => (
                                                <Card key={exam.id} withBorder p="md" radius="md">
                                                    <Group justify="space-between" align="flex-start">
                                                        <div style={{ flex: 1 }}>
                                                            <Group gap="sm" mb="xs">
                                                                <Text fw={600} size="lg">{exam.title}</Text>
                                                                <Badge color={getExamTypeColor(exam.type)} variant="light">
                                                                    {getExamTypeLabel(exam.type)}
                                                                </Badge>
                                                                <Badge color="blue" variant="outline">
                                                                    {exam.weight}% de la note finale
                                                                </Badge>
                                                            </Group>
                                                            
                                                            <Group gap="lg" mb="sm">
                                                                <Group gap="xs">
                                                                    <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                                                                    <Text size="sm">{formatDate(exam.date)}</Text>
                                                                </Group>
                                                                <Group gap="xs">
                                                                    <IconTarget size={16} color="var(--mantine-color-gray-6)" />
                                                                    <Text size="sm">{exam.maxPoints} points</Text>
                                                                </Group>
                                                            </Group>

                                                            <Group gap="xl">
                                                                <div>
                                                                    <Text size="sm" c="dimmed" mb="xs">Votre note</Text>
                                                                    <Group gap="xs">
                                                                        <Text fw={600} size="lg" c={getGradeColor(exam.studentGrade!)}>
                                                                            {exam.studentGrade!.toFixed(1)}%
                                                                        </Text>
                                                                        {getGradeIcon(exam.studentGrade!, exam.classAverage!)}
                                                                    </Group>
                                                                </div>
                                                                
                                                                <div>
                                                                    <Text size="sm" c="dimmed" mb="xs">Moyenne classe</Text>
                                                                    <Text fw={500} c="dimmed">
                                                                        {exam.classAverage!.toFixed(1)}%
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                        </div>
                                                    </Group>
                                                </Card>
                                            ))}
                                        
                                        {mockSubjects.find(s => s.id === selectedSubject)?.exams.filter(e => e.status === 'graded').length === 0 && (
                                            <Center py="xl">
                                                <Text c="dimmed">Aucun examen terminé</Text>
                                            </Center>
                                        )}
                                    </Stack>
                                </Tabs.Panel>
                            </Tabs>
                        </Paper>
                    )}

                    {/* Graphique des notes - Par matière */}
                    <Paper withBorder p="lg" radius="md">
                        <Title order={2} size="h3" mb="lg">
                            Évolution des notes
                            {selectedSubject && (
                                <Text component="span" size="lg" c="dimmed" fw={400}>
                                    {' '}- {mockSubjects.find(s => s.id === selectedSubject)?.name}
                                </Text>
                            )}
                        </Title>
                            
                            {chartData.length > 0 ? (
                                <Box style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="#666"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis 
                                                domain={[0, 100]}
                                                stroke="#666"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <Tooltip
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <Paper p="md" radius="md" withBorder shadow="md">
                                                                <Stack gap="xs">
                                                                    <Text fw={600} size="sm">{data.name}</Text>
                                                                    <Text size="xs" c="dimmed">{data.fullDate}</Text>
                                                                    <Text size="xs" c="dimmed">{data.subject} • {data.type}</Text>
                                                                    <Divider />
                                                                    <Group justify="space-between">
                                                                        <Text size="sm" c="blue" fw={500}>
                                                                            Votre note: {data.studentGrade}%
                                                                        </Text>
                                                                    </Group>
                                                                    <Group justify="space-between">
                                                                        <Text size="sm" c="gray" fw={500}>
                                                                            Moyenne classe: {data.classAverage}%
                                                                        </Text>
                                                                    </Group>
                                                                    <Text size="xs" c="dimmed">
                                                                        {data.maxPoints} points • {data.studentGrade > data.classAverage ? 'Au-dessus' : data.studentGrade < data.classAverage ? 'En-dessous' : 'Égal'} de la moyenne
                                                                    </Text>
                                                                </Stack>
                                                            </Paper>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend 
                                                verticalAlign="top" 
                                                height={36}
                                                iconType="line"
                                                formatter={(value) => (
                                                    <Text size="sm" fw={500}>
                                                        {value === 'studentGrade' ? 'Votre note' : 'Moyenne classe'}
                                                    </Text>
                                                )}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="studentGrade"
                                                stroke="#228be6"
                                                strokeWidth={3}
                                                dot={{ fill: '#228be6', strokeWidth: 2, r: 6 }}
                                                activeDot={{ r: 8, stroke: '#228be6', strokeWidth: 2 }}
                                                name="studentGrade"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="classAverage"
                                                stroke="#868e96"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={{ fill: '#868e96', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: '#868e96', strokeWidth: 2 }}
                                                name="classAverage"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Center py="xl">
                                    <Stack align="center" gap="md">
                                        <ThemeIcon size="xl" color="gray" variant="light">
                                            <IconChartLine size={32} />
                                        </ThemeIcon>
                                        <Text c="dimmed" size="lg">Aucune note disponible</Text>
                                        <Text c="dimmed" size="sm" ta="center">
                                            Les notes apparaîtront ici une fois que vous aurez des examens notés
                                        </Text>
                                    </Stack>
                                </Center>
                            )}
                        </Paper>
                </Stack>
        </MainLayout>
    );
};

export default MySessionPage;
