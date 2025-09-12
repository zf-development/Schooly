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
    Modal,
    TextInput,
    Textarea,
    FileInput,
    Alert,
    Timeline,
    Avatar,
    Divider,
    Paper,
    Grid,
    ThemeIcon,
    ActionIcon,
    Menu,
    Progress,
    Box,
    Center,
    Loader,
    SimpleGrid
} from '@mantine/core';
import {
    IconUpload,
    IconFileText,
    IconCalendar,
    IconClock,
    IconUser,
    IconDots,
    IconCheck,
    IconX,
    IconAlertCircle,
    IconDownload,
    IconEye,
    IconEdit,
    IconTrash,
    IconPlus,
    IconBook,
    IconClipboardCheck,
    IconClipboardList,
    IconCalendarPlus,
    IconChartBar
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

// Types pour les données placeholder
interface Homework {
    id: string;
    title: string;
    description: string;
    subject: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'late' | 'graded';
    maxPoints: number;
    points?: number;
    attachments: string[];
    instructions: string;
    createdAt: string;
    teacher: {
        name: string;
        avatar: string;
    };
}

interface Submission {
    id: string;
    homeworkId: string;
    content: string;
    attachments: File[];
    submittedAt: string;
    status: 'draft' | 'submitted' | 'graded';
    feedback?: string;
    grade?: number;
}

// Données placeholder
const mockHomeworks: Homework[] = [
    {
        id: '1',
        title: 'Analyse de texte - Les Misérables',
        description: 'Analyser les thèmes principaux du roman de Victor Hugo',
        subject: 'Français',
        dueDate: '2024-12-28T23:59:00',
        status: 'pending',
        maxPoints: 20,
        attachments: ['consigne_analyse.pdf'],
        instructions: 'Rédigez une analyse de 3 pages minimum sur les thèmes de la justice sociale et de la rédemption dans Les Misérables.',
        createdAt: '2024-12-15T09:00:00',
        teacher: {
            name: 'Mme Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '2',
        title: 'Problèmes de mathématiques - Algèbre',
        description: 'Résoudre 15 problèmes d\'algèbre linéaire',
        subject: 'Mathématiques',
        dueDate: '2024-12-20T17:00:00',
        status: 'submitted',
        maxPoints: 15,
        points: 14,
        attachments: ['exercices_algebre.pdf'],
        instructions: 'Résolvez les exercices 1 à 15 du chapitre 3. Montrez tous vos calculs.',
        createdAt: '2024-12-10T14:30:00',
        teacher: {
            name: 'M. Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '3',
        title: 'Rapport de laboratoire - Chimie',
        description: 'Rapport sur l\'expérience de titration',
        subject: 'Chimie',
        dueDate: '2024-12-18T16:00:00',
        status: 'late',
        maxPoints: 25,
        attachments: ['protocole_titration.pdf', 'donnees_experimentales.xlsx'],
        instructions: 'Rédigez un rapport complet de l\'expérience de titration acide-base effectuée en laboratoire.',
        createdAt: '2024-12-05T10:15:00',
        teacher: {
            name: 'Dr. Moreau',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '4',
        title: 'Présentation orale - Histoire',
        description: 'Présentation sur la Révolution française',
        subject: 'Histoire',
        dueDate: '2024-12-15T14:00:00',
        status: 'graded',
        maxPoints: 30,
        points: 28,
        attachments: ['guide_presentation.pdf'],
        instructions: 'Préparez une présentation de 10 minutes sur un aspect spécifique de la Révolution française.',
        createdAt: '2024-12-01T11:00:00',
        teacher: {
            name: 'M. Rousseau',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '5',
        title: 'Dissertation de philosophie',
        description: 'Sujet : "La liberté est-elle une illusion ?"',
        subject: 'Philosophie',
        dueDate: '2025-01-15T23:59:00',
        status: 'pending',
        maxPoints: 20,
        attachments: ['sujets_dissertation.pdf'],
        instructions: 'Rédigez une dissertation de 4 pages minimum en répondant à la question posée. Utilisez les concepts vus en cours.',
        createdAt: '2024-12-20T09:00:00',
        teacher: {
            name: 'Mme Laurent',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '6',
        title: 'Exercices de physique - Mécanique',
        description: 'Problèmes de cinématique et dynamique',
        subject: 'Physique',
        dueDate: '2024-12-22T16:00:00',
        status: 'submitted',
        maxPoints: 18,
        attachments: ['exercices_mecanique.pdf'],
        instructions: 'Résolvez les exercices 1, 3, 5, 7 et 9 du chapitre 4. Montrez tous vos calculs et schémas.',
        createdAt: '2024-12-08T14:30:00',
        teacher: {
            name: 'Dr. Petit',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '7',
        title: 'Commentaire de texte - Anglais',
        description: 'Analyse d\'un extrait de "1984" de George Orwell',
        subject: 'Anglais',
        dueDate: '2024-12-19T12:00:00',
        status: 'graded',
        maxPoints: 25,
        points: 22,
        attachments: ['extrait_1984.pdf', 'vocabulaire_utile.pdf'],
        instructions: 'Analysez l\'extrait fourni en anglais. Identifiez les procédés littéraires et le message de l\'auteur.',
        createdAt: '2024-12-05T10:00:00',
        teacher: {
            name: 'Mr. Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '8',
        title: 'Projet de programmation',
        description: 'Création d\'une application web simple',
        subject: 'Informatique',
        dueDate: '2025-01-10T23:59:00',
        status: 'pending',
        maxPoints: 40,
        attachments: ['cahier_charges.pdf', 'ressources_web.pdf'],
        instructions: 'Développez une application web responsive en HTML/CSS/JavaScript. Le thème est libre.',
        createdAt: '2024-12-18T16:00:00',
        teacher: {
            name: 'M. Garcia',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '9',
        title: 'Résumé d\'article scientifique',
        description: 'Synthèse d\'un article sur le réchauffement climatique',
        subject: 'SVT',
        dueDate: '2024-12-16T14:00:00',
        status: 'late',
        maxPoints: 15,
        attachments: ['article_climat.pdf'],
        instructions: 'Rédigez un résumé de 2 pages de l\'article fourni en mettant l\'accent sur les causes et conséquences.',
        createdAt: '2024-12-01T11:30:00',
        teacher: {
            name: 'Mme Bernard',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '10',
        title: 'Traduction latin-français',
        description: 'Traduction d\'un texte de Cicéron',
        subject: 'Latin',
        dueDate: '2024-12-25T10:00:00',
        status: 'graded',
        maxPoints: 20,
        points: 18,
        attachments: ['texte_ciceron.pdf', 'dictionnaire_latin.pdf'],
        instructions: 'Traduisez le texte de Cicéron en français moderne. Expliquez les figures de style utilisées.',
        createdAt: '2024-12-10T09:00:00',
        teacher: {
            name: 'M. Lefebvre',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '11',
        title: 'Analyse économique',
        description: 'Étude de cas : crise économique de 2008',
        subject: 'Économie',
        dueDate: '2025-01-20T17:00:00',
        status: 'pending',
        maxPoints: 30,
        attachments: ['cas_crise_2008.pdf', 'donnees_economiques.xlsx'],
        instructions: 'Analysez les causes et conséquences de la crise de 2008. Proposez des solutions préventives.',
        createdAt: '2024-12-22T13:00:00',
        teacher: {
            name: 'Dr. Moreau',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '12',
        title: 'Expérience de laboratoire - Biologie',
        description: 'Observation de cellules au microscope',
        subject: 'SVT',
        dueDate: '2024-12-21T16:00:00',
        status: 'submitted',
        maxPoints: 20,
        attachments: ['protocole_microscope.pdf'],
        instructions: 'Réalisez les observations demandées et rédigez un compte-rendu avec schémas annotés.',
        createdAt: '2024-12-08T10:00:00',
        teacher: {
            name: 'Mme Bernard',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '13',
        title: 'Rédaction créative - Espagnol',
        description: 'Écriture d\'une nouvelle en espagnol',
        subject: 'Espagnol',
        dueDate: '2025-01-25T23:59:00',
        status: 'pending',
        maxPoints: 25,
        attachments: ['consignes_redaction.pdf', 'vocabulaire_espagnol.pdf'],
        instructions: 'Écrivez une nouvelle de 2 pages en espagnol. Le thème est libre mais utilisez le subjonctif.',
        createdAt: '2024-12-20T15:30:00',
        teacher: {
            name: 'Señora Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '14',
        title: 'Problèmes de géométrie',
        description: 'Exercices sur les triangles et cercles',
        subject: 'Mathématiques',
        dueDate: '2024-12-27T12:00:00',
        status: 'graded',
        maxPoints: 22,
        points: 19,
        attachments: ['exercices_geometrie.pdf'],
        instructions: 'Résolvez les exercices 2, 4, 6, 8 et 10. Justifiez chaque étape de vos démonstrations.',
        createdAt: '2024-12-12T11:00:00',
        teacher: {
            name: 'M. Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
    },
    {
        id: '15',
        title: 'Analyse de document - Géographie',
        description: 'Étude d\'une carte de densité de population',
        subject: 'Géographie',
        dueDate: '2024-12-30T14:00:00',
        status: 'submitted',
        maxPoints: 18,
        attachments: ['carte_densite.pdf', 'donnees_demographiques.pdf'],
        instructions: 'Analysez la carte fournie et expliquez les facteurs de répartition de la population.',
        createdAt: '2024-12-15T09:30:00',
        teacher: {
            name: 'Mme Durand',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
        }
    }
];

const HomeworkSubmissionPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
    const [submissionContent, setSubmissionContent] = useState('');
    const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'yellow';
            case 'submitted': return 'blue';
            case 'late': return 'red';
            case 'graded': return 'green';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'submitted': return 'Rendu';
            case 'late': return 'En retard';
            case 'graded': return 'Noté';
            default: return 'Inconnu';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const handleSubmitHomework = () => {
        if (!selectedHomework) return;

        const newSubmission: Submission = {
            id: Date.now().toString(),
            homeworkId: selectedHomework.id,
            content: submissionContent,
            attachments: submissionFiles,
            submittedAt: new Date().toISOString(),
            status: 'submitted'
        };

        setSubmissions(prev => [...prev, newSubmission]);
        
        // Mettre à jour le statut du devoir
        const updatedHomework = { ...selectedHomework, status: 'submitted' as const };
        setSelectedHomework(updatedHomework);
        
        setSubmissionModalOpen(false);
        setSubmissionContent('');
        setSubmissionFiles([]);
    };

    const handleAddToCalendar = (homework: Homework) => {
        // Simulation de l'ajout à l'agenda
        console.log('Ajout à l\'agenda:', homework);
        // Ici, vous pourriez intégrer avec un service de calendrier (Google Calendar, Outlook, etc.)
        // ou ouvrir une modal pour configurer l'événement
    };

    const handleSubjectClick = (subject: string) => {
        if (selectedSubject === subject) {
            // Si la même matière est cliquée, désélectionner
            setSelectedSubject(null);
        } else {
            // Sélectionner la nouvelle matière
            setSelectedSubject(subject);
        }
    };

    const getSubmissionForHomework = (homeworkId: string) => {
        return submissions.find(sub => sub.homeworkId === homeworkId);
    };

    // Filtrer les devoirs selon la matière sélectionnée
    const filteredHomeworks = selectedSubject 
        ? mockHomeworks.filter(h => h.subject === selectedSubject)
        : mockHomeworks;

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconUpload size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Devoirs
                            </Title>
                            <Text c="dimmed" size="sm">
                                Gérez vos devoirs et remises académiques
                            </Text>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            variant="light"
                        >
                            Nouveau devoir
                        </Button>
                    </Group>
                </Group>

                <Stack gap="xl">

                    {/* Vue d'ensemble des devoirs par matière */}
                    <Paper withBorder p="lg" radius="md">
                        <Title order={2} size="h3" mb="lg">
                            Vue d'ensemble par matière
                        </Title>
                        <Grid>
                            {Array.from(new Set(mockHomeworks.map(h => h.subject))).map(subject => {
                                const subjectHomeworks = mockHomeworks.filter(h => h.subject === subject);
                                const pending = subjectHomeworks.filter(h => h.status === 'pending').length;
                                const submitted = subjectHomeworks.filter(h => h.status === 'submitted').length;
                                const graded = subjectHomeworks.filter(h => h.status === 'graded').length;
                                const late = subjectHomeworks.filter(h => h.status === 'late').length;
                                
                                
                                return (
                                    <Grid.Col key={subject} span={{ base: 12, sm: 6, md: 4 }}>
                                        <Card 
                                            withBorder 
                                            p="md" 
                                            radius="md"
                                            style={{ 
                                                cursor: 'pointer',
                                                borderColor: selectedSubject === subject ? 'var(--mantine-color-blue-6)' : undefined,
                                                borderWidth: selectedSubject === subject ? 2 : 1,
                                                backgroundColor: selectedSubject === subject ? 'var(--mantine-color-blue-0)' : undefined
                                            }}
                                            onClick={() => handleSubjectClick(subject)}
                                        >
                                            <Stack gap="sm">
                                                <Group justify="space-between" align="center">
                                                    <Text fw={600} size="lg">{subject}</Text>
                                                    <Badge color="blue" variant="light">
                                                        {subjectHomeworks.length} devoirs
                                                    </Badge>
                                                </Group>
                                                
                                                <Group gap="xs">
                                                    {pending > 0 && (
                                                        <Badge color="yellow" variant="light" size="sm">
                                                            {pending} en attente
                                                        </Badge>
                                                    )}
                                                    {submitted > 0 && (
                                                        <Badge color="blue" variant="light" size="sm">
                                                            {submitted} rendus
                                                        </Badge>
                                                    )}
                                                    {graded > 0 && (
                                                        <Badge color="green" variant="light" size="sm">
                                                            {graded} notés
                                                        </Badge>
                                                    )}
                                                    {late > 0 && (
                                                        <Badge color="red" variant="light" size="sm">
                                                            {late} en retard
                                                        </Badge>
                                                    )}
                                                </Group>
                                                
                                                <Box>
                                                    <Group justify="space-between" mb="xs">
                                                        <Text size="xs" c="dimmed">Progression</Text>
                                                        <Text size="xs" fw={500}>
                                                            {Math.round(((submitted + graded) / subjectHomeworks.length) * 100)}%
                                                        </Text>
                                                    </Group>
                                                    <Progress 
                                                        value={((submitted + graded) / subjectHomeworks.length) * 100} 
                                                        size="sm" 
                                                        color="blue"
                                                    />
                                                </Box>
                                            </Stack>
                                        </Card>
                                    </Grid.Col>
                                );
                            })}
                        </Grid>
                    </Paper>

                    {/* Graphique des notes par matière */}
                    <Paper withBorder p="lg" radius="md">
                        <Group justify="space-between" align="center" mb="lg">
                            <Title order={2} size="h3">
                                Graphique des notes par matière
                            </Title>
                            <ThemeIcon color="blue" variant="light" size="lg">
                                <IconChartBar size={20} />
                            </ThemeIcon>
                        </Group>
                        
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                            {Array.from(new Set(mockHomeworks.map(h => h.subject))).map(subject => {
                                const subjectHomeworks = mockHomeworks.filter(h => h.subject === subject);
                                const gradedHomeworks = subjectHomeworks.filter(h => h.points !== undefined && h.maxPoints !== undefined);
                                const averageGrade = gradedHomeworks.length > 0 
                                    ? gradedHomeworks.reduce((sum, h) => sum + (h.points! / h.maxPoints! * 100), 0) / gradedHomeworks.length
                                    : null;
                                
                                if (averageGrade === null) return null;
                                
                                return (
                                    <Card key={subject} withBorder p="md" radius="md">
                                        <Stack gap="sm">
                                            <Group justify="space-between" align="center">
                                                <Text fw={600} size="sm" c="dimmed">
                                                    {subject}
                                                </Text>
                                                <Badge 
                                                    color={averageGrade >= 80 ? 'green' : averageGrade >= 70 ? 'blue' : averageGrade >= 60 ? 'yellow' : 'red'}
                                                    variant="light"
                                                    size="sm"
                                                >
                                                    {averageGrade.toFixed(1)}%
                                                </Badge>
                                            </Group>
                                            
                                            {/* Barre de progression personnalisée pour le graphique */}
                                            <Box>
                                                <Progress 
                                                    value={averageGrade} 
                                                    color={averageGrade >= 80 ? 'green' : averageGrade >= 70 ? 'blue' : averageGrade >= 60 ? 'yellow' : 'red'}
                                                    size="lg"
                                                    radius="md"
                                                    style={{ height: 24 }}
                                                />
                                            </Box>
                                            
                                            <Group justify="space-between" align="center">
                                                <Text size="xs" c="dimmed">
                                                    {gradedHomeworks.length} devoir{gradedHomeworks.length > 1 ? 's' : ''} noté{gradedHomeworks.length > 1 ? 's' : ''}
                                                </Text>
                                                <Text size="xs" fw={500} c="dimmed">
                                                    {averageGrade >= 80 ? 'Excellent' : 
                                                     averageGrade >= 70 ? 'Bien' : 
                                                     averageGrade >= 60 ? 'Assez bien' : 'À améliorer'}
                                                </Text>
                                            </Group>
                                        </Stack>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                        
                        {/* Légende du graphique */}
                        <Box mt="lg" p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 8 }}>
                            <Text size="sm" fw={500} mb="xs">Légende des couleurs :</Text>
                            <Group gap="md">
                                <Group gap="xs">
                                    <Box style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-green-6)', borderRadius: 2 }} />
                                    <Text size="xs">≥ 80% - Excellent</Text>
                                </Group>
                                <Group gap="xs">
                                    <Box style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-blue-6)', borderRadius: 2 }} />
                                    <Text size="xs">70-79% - Bien</Text>
                                </Group>
                                <Group gap="xs">
                                    <Box style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-yellow-6)', borderRadius: 2 }} />
                                    <Text size="xs">60-69% - Assez bien</Text>
                                </Group>
                                <Group gap="xs">
                                    <Box style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-red-6)', borderRadius: 2 }} />
                                    <Text size="xs">&lt; 60% - À améliorer</Text>
                                </Group>
                            </Group>
                        </Box>
                    </Paper>

                    {/* Liste des devoirs avec filtres et tri */}
                    <Paper withBorder p="lg" radius="md">
                        <Group justify="space-between" align="center" mb="lg">
                            <Group gap="md">
                                <Title order={2} size="h3">
                                    Détail des devoirs
                                </Title>
                                {selectedSubject && (
                                    <Badge 
                                        color="blue" 
                                        variant="light" 
                                        size="lg"
                                        rightSection={
                                            <ActionIcon 
                                                size="xs" 
                                                color="blue" 
                                                variant="transparent"
                                                onClick={() => setSelectedSubject(null)}
                                            >
                                                <IconX size={12} />
                                            </ActionIcon>
                                        }
                                    >
                                        Filtre: {selectedSubject}
                                    </Badge>
                                )}
                            </Group>
                            <Group gap="md">
                                <Group gap="xs">
                                    <Badge color="yellow" variant="light" size="lg">
                                        {filteredHomeworks.filter(h => h.status === 'pending').length} À rendre
                                    </Badge>
                                    <Badge color="blue" variant="light" size="lg">
                                        {filteredHomeworks.filter(h => h.status === 'submitted').length} Rendus
                                    </Badge>
                                    <Badge color="green" variant="light" size="lg">
                                        {filteredHomeworks.filter(h => h.status === 'graded').length} Notés
                                    </Badge>
                                </Group>
                            </Group>
                        </Group>
                        
                        <Stack gap="md">
                            {/* Devoirs à rendre - Triés par urgence */}
                        {filteredHomeworks.filter(h => h.status === 'pending' || h.status === 'late').length > 0 && (
                            <Box mb="xl">
                                <Group gap="xs" mb="md">
                                    <IconClipboardList size={20} color="var(--mantine-color-red-6)" />
                                    <Title order={3} size="h4" c="red">
                                        À rendre ({filteredHomeworks.filter(h => h.status === 'pending' || h.status === 'late').length})
                                    </Title>
                                </Group>
                                <Stack gap="md">
                                    {filteredHomeworks
                                        .filter(h => h.status === 'pending' || h.status === 'late')
                                        .sort((a, b) => {
                                            // Tri par urgence : d'abord les en retard, puis par date d'échéance
                                            if (a.status === 'late' && b.status !== 'late') return -1;
                                            if (b.status === 'late' && a.status !== 'late') return 1;
                                            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                        })
                                        .map((homework) => {
                                            const submission = getSubmissionForHomework(homework.id);
                                            const isOverdueHomework = isOverdue(homework.dueDate);
                                            
                                            return (
                                                <Card key={homework.id} withBorder shadow="sm">
                                                    <Stack gap="md">
                                                        <Group justify="space-between" align="flex-start">
                                                            <div style={{ flex: 1 }}>
                                                                <Group gap="sm" mb="xs">
                                                                    <Title order={3} size="h4">
                                                                        {homework.title}
                                                                    </Title>
                                                                    <Badge 
                                                                        color={getStatusColor(homework.status)}
                                                                        variant="light"
                                                                    >
                                                                        {getStatusLabel(homework.status)}
                                                                    </Badge>
                                                                    {isOverdueHomework && homework.status === 'pending' && (
                                                                        <Badge color="red" variant="filled">
                                                                            En retard
                                                                        </Badge>
                                                                    )}
                                                                </Group>
                                                                
                                                                <Text size="sm" c="dimmed" mb="sm">
                                                                    {homework.description}
                                                                </Text>
                                                                
                                                                <Group gap="lg" mb="sm">
                                                                    <Group gap="xs">
                                                                        <IconCalendar size={16} />
                                                                        <Text size="sm">
                                                                            Échéance: {formatDate(homework.dueDate)}
                                                                        </Text>
                                                                    </Group>
                                                                    <Group gap="xs">
                                                                        <IconUser size={16} />
                                                                        <Text size="sm">
                                                                            {homework.teacher.name}
                                                                        </Text>
                                                                    </Group>
                                                                    <Group gap="xs">
                                                                        <Text size="sm" fw={500}>
                                                                            {homework.subject}
                                                                        </Text>
                                                                    </Group>
                                                                    <Group gap="xs">
                                                                        <Text size="sm">
                                                                            {homework.points ? `${homework.points}/${homework.maxPoints}` : `${homework.maxPoints} points`}
                                                                        </Text>
                                                                    </Group>
                                                                </Group>

                                                                {homework.points && (
                                                                    <Box mb="sm">
                                                                        <Group justify="space-between" mb="xs">
                                                                            <Text size="sm" fw={500}>Note</Text>
                                                                            <Text size="sm">{homework.points}/{homework.maxPoints}</Text>
                                                                        </Group>
                                                                        <Progress 
                                                                            value={(homework.points / homework.maxPoints) * 100} 
                                                                            color={homework.points >= homework.maxPoints * 0.8 ? 'green' : homework.points >= homework.maxPoints * 0.6 ? 'yellow' : 'red'}
                                                                            size="sm"
                                                                        />
                                                                    </Box>
                                                                )}
                                                            </div>
                                                            
                                            <Group gap="sm">
                                                {homework.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        leftSection={<IconUpload size={16} />}
                                                        onClick={() => {
                                                            setSelectedHomework(homework);
                                                            setSubmissionModalOpen(true);
                                                        }}
                                                        color={isOverdueHomework ? "red" : "blue"}
                                                        variant={isOverdueHomework ? "filled" : "light"}
                                                    >
                                                        {isOverdueHomework ? "Rendre (en retard)" : "Rendre le devoir"}
                                                    </Button>
                                                )}
                                                
                                                {homework.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        leftSection={<IconCalendarPlus size={16} />}
                                                        onClick={() => handleAddToCalendar(homework)}
                                                        variant="outline"
                                                        color="green"
                                                    >
                                                        Ajouter à l'agenda
                                                    </Button>
                                                )}
                                                
                                                {homework.status === 'submitted' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        leftSection={<IconEye size={16} />}
                                                        onClick={() => {
                                                            setSelectedHomework(homework);
                                                            setSubmissionModalOpen(true);
                                                        }}
                                                    >
                                                        Voir la remise
                                                    </Button>
                                                )}
                                                
                                                <Menu shadow="md" width={200}>
                                                    <Menu.Target>
                                                        <ActionIcon variant="subtle" color="gray">
                                                            <IconDots size={16} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown>
                                                        <Menu.Item leftSection={<IconEye size={14} />}>
                                                            Voir les détails
                                                        </Menu.Item>
                                                        {homework.attachments.length > 0 && (
                                                            <Menu.Item leftSection={<IconDownload size={14} />}>
                                                                Télécharger les fichiers
                                                            </Menu.Item>
                                                        )}
                                                        {homework.status === 'submitted' && (
                                                            <Menu.Item 
                                                                leftSection={<IconEdit size={14} />}
                                                                onClick={() => {
                                                                    setSelectedHomework(homework);
                                                                    setSubmissionModalOpen(true);
                                                                }}
                                                            >
                                                                Modifier la remise
                                                            </Menu.Item>
                                                        )}
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Group>

                                        {submission && (
                                            <Paper withBorder p="md" bg="gray.0">
                                                <Group justify="space-between" mb="sm">
                                                    <Text size="sm" fw={500}>Votre remise</Text>
                                                    <Badge color="blue" variant="light" size="sm">
                                                        {formatDate(submission.submittedAt)}
                                                    </Badge>
                                                </Group>
                                                <Text size="sm" mb="sm">
                                                    {submission.content}
                                                </Text>
                                                {submission.attachments.length > 0 && (
                                                    <Group gap="xs">
                                                        <Text size="sm" c="dimmed">Fichiers joints:</Text>
                                                        {submission.attachments.map((file, index) => (
                                                            <Badge key={index} variant="light" size="sm">
                                                                {file.name}
                                                            </Badge>
                                                        ))}
                                                    </Group>
                                                )}
                                            </Paper>
                                        )}

                                        {homework.attachments.length > 0 && (
                                            <Group gap="xs">
                                                <Text size="sm" c="dimmed">Fichiers du devoir:</Text>
                                                {homework.attachments.map((file, index) => (
                                                    <Badge key={index} variant="outline" size="sm">
                                                        {file}
                                                    </Badge>
                                                ))}
                                            </Group>
                                        )}
                                    </Stack>
                                </Card>
                                            );
                                        })}
                                </Stack>
                            </Box>
                        )}

                            {/* Devoirs rendus - Triés par date de soumission */}
                            {filteredHomeworks.filter(h => h.status === 'submitted' || h.status === 'graded').length > 0 && (
                                <Box>
                                    <Group gap="xs" mb="md">
                                        <IconClipboardCheck size={20} color="var(--mantine-color-green-6)" />
                                        <Title order={3} size="h4" c="green">
                                            Rendus ({filteredHomeworks.filter(h => h.status === 'submitted' || h.status === 'graded').length})
                                        </Title>
                                    </Group>
                                    <Stack gap="md">
                                        {filteredHomeworks
                                            .filter(h => h.status === 'submitted' || h.status === 'graded')
                                            .sort((a, b) => {
                                                // Tri par statut (notés en premier), puis par date d'échéance
                                                if (a.status === 'graded' && b.status !== 'graded') return -1;
                                                if (b.status === 'graded' && a.status !== 'graded') return 1;
                                                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                                            })
                                            .map((homework) => {
                                                const submission = getSubmissionForHomework(homework.id);
                                                const isOverdueHomework = isOverdue(homework.dueDate);
                                                
                                                return (
                                                    <Card key={homework.id} withBorder shadow="sm">
                                                        <Stack gap="md">
                                                            <Group justify="space-between" align="flex-start">
                                                                <div style={{ flex: 1 }}>
                                                                    <Group gap="sm" mb="xs">
                                                                        <Title order={3} size="h4">
                                                                        {homework.title}
                                                                    </Title>
                                                                    <Badge 
                                                                        color={getStatusColor(homework.status)}
                                                                        variant="light"
                                                                    >
                                                                        {getStatusLabel(homework.status)}
                                                                    </Badge>
                                                                    {isOverdueHomework && homework.status === 'pending' && (
                                                                        <Badge color="red" variant="filled">
                                                                            En retard
                                                                        </Badge>
                                                                    )}
                                                                </Group>
                                                                
                                                                <Text size="sm" c="dimmed" mb="sm">
                                                                    {homework.description}
                                                                </Text>
                                                                
                                                                <Group gap="lg" mb="sm">
                                                                    <Group gap="xs">
                                                                        <IconCalendar size={16} />
                                                                        <Text size="sm">
                                                                            Échéance: {formatDate(homework.dueDate)}
                                                                        </Text>
                                                                    </Group>
                                                                    <Group gap="xs">
                                                                        <IconUser size={16} />
                                                                        <Text size="sm">
                                                                            {homework.teacher.name}
                                                                        </Text>
                                                                    </Group>
                                                                    <Group gap="xs">
                                                                        <Text size="sm" fw={500}>
                                                                            {homework.subject}
                                                                        </Text>
                                                                    </Group>
                                                                    <Group gap="xs">
                                                                        <Text size="sm">
                                                                            {homework.points ? `${homework.points}/${homework.maxPoints}` : `${homework.maxPoints} points`}
                                                                        </Text>
                                                                    </Group>
                                                                </Group>

                                                                {homework.points && (
                                                                    <Box mb="sm">
                                                                        <Group justify="space-between" mb="xs">
                                                                            <Text size="sm" fw={500}>Note</Text>
                                                                            <Text size="sm">{homework.points}/{homework.maxPoints}</Text>
                                                                        </Group>
                                                                        <Progress 
                                                                            value={(homework.points / homework.maxPoints) * 100} 
                                                                            color={homework.points >= homework.maxPoints * 0.8 ? 'green' : homework.points >= homework.maxPoints * 0.6 ? 'yellow' : 'red'}
                                                                            size="sm"
                                                                        />
                                                                    </Box>
                                                                )}
                                                            </div>
                                                            
                                                            <Group gap="sm">
                                                                {homework.status === 'submitted' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        leftSection={<IconEye size={16} />}
                                                                        onClick={() => {
                                                                            setSelectedHomework(homework);
                                                                            setSubmissionModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Voir la remise
                                                                    </Button>
                                                                )}
                                                                
                                                                {homework.status === 'pending' && (
                                                                    <Button
                                                                        size="sm"
                                                                        leftSection={<IconCalendarPlus size={16} />}
                                                                        onClick={() => handleAddToCalendar(homework)}
                                                                        variant="outline"
                                                                        color="green"
                                                                    >
                                                                        Ajouter à l'agenda
                                                                    </Button>
                                                                )}
                                                                
                                                                <Menu shadow="md" width={200}>
                                                                    <Menu.Target>
                                                                        <ActionIcon variant="subtle" color="gray">
                                                                            <IconDots size={16} />
                                                                        </ActionIcon>
                                                                    </Menu.Target>
                                                                    <Menu.Dropdown>
                                                                        <Menu.Item leftSection={<IconEye size={14} />}>
                                                                            Voir les détails
                                                                        </Menu.Item>
                                                                        {homework.attachments.length > 0 && (
                                                                            <Menu.Item leftSection={<IconDownload size={14} />}>
                                                                                Télécharger les fichiers
                                                                            </Menu.Item>
                                                                        )}
                                                                        {homework.status === 'submitted' && (
                                                                            <Menu.Item 
                                                                                leftSection={<IconEdit size={14} />}
                                                                                onClick={() => {
                                                                                    setSelectedHomework(homework);
                                                                                    setSubmissionModalOpen(true);
                                                                                }}
                                                                            >
                                                                                Modifier la remise
                                                                            </Menu.Item>
                                                                        )}
                                                                    </Menu.Dropdown>
                                                                </Menu>
                                                            </Group>
                                                        </Group>

                                                        {submission && (
                                                            <Paper withBorder p="md" bg="gray.0">
                                                                <Group justify="space-between" mb="sm">
                                                                    <Text size="sm" fw={500}>Votre remise</Text>
                                                                    <Badge color="blue" variant="light" size="sm">
                                                                        {formatDate(submission.submittedAt)}
                                                                    </Badge>
                                                                </Group>
                                                                <Text size="sm" mb="sm">
                                                                    {submission.content}
                                                                </Text>
                                                                {submission.attachments.length > 0 && (
                                                                    <Group gap="xs">
                                                                        <Text size="sm" c="dimmed">Fichiers joints:</Text>
                                                                        {submission.attachments.map((file, index) => (
                                                                            <Badge key={index} variant="light" size="sm">
                                                                                {file.name}
                                                                            </Badge>
                                                                        ))}
                                                                    </Group>
                                                                )}
                                                            </Paper>
                                                        )}

                                                        {homework.attachments.length > 0 && (
                                                            <Group gap="xs">
                                                                <Text size="sm" c="dimmed">Fichiers du devoir:</Text>
                                                                {homework.attachments.map((file, index) => (
                                                                    <Badge key={index} variant="outline" size="sm">
                                                                        {file}
                                                                    </Badge>
                                                                ))}
                                                            </Group>
                                                        )}
                                                    </Stack>
                                                </Card>
                                            );
                                        })}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </Paper>

            </Stack>

            {/* Modal de remise de devoir */}
            <Modal
                opened={submissionModalOpen}
                onClose={() => setSubmissionModalOpen(false)}
                title={`Rendre: ${selectedHomework?.title}`}
                size="xl"
            >
                {selectedHomework && (
                    <Stack gap="lg">
                        {/* Informations du devoir */}
                        <Paper withBorder p="md" bg="gray.0">
                            <Stack gap="sm">
                                <Title order={3} size="h4">
                                    {selectedHomework.title}
                                </Title>
                                
                                <Text size="sm" c="dimmed">
                                    {selectedHomework.description}
                                </Text>
                                
                                <Grid>
                                    <Grid.Col span={6}>
                                        <Group gap="xs">
                                            <IconUser size={16} />
                                            <Text size="sm">
                                                <strong>Professeur:</strong> {selectedHomework.teacher.name}
                                            </Text>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Group gap="xs">
                                            <IconCalendar size={16} />
                                            <Text size="sm">
                                                <strong>Échéance:</strong> {formatDate(selectedHomework.dueDate)}
                                            </Text>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Group gap="xs">
                                            <Text size="sm">
                                                <strong>Matière:</strong> {selectedHomework.subject}
                                            </Text>
                                        </Group>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Group gap="xs">
                                            <Text size="sm">
                                                <strong>Points:</strong> {selectedHomework.maxPoints} points
                                            </Text>
                                        </Group>
                                    </Grid.Col>
                                </Grid>
                                
                                {selectedHomework.attachments.length > 0 && (
                                    <Box>
                                        <Text size="sm" fw={500} mb="xs">
                                            Fichiers du devoir:
                                        </Text>
                                        <Group gap="xs">
                                            {selectedHomework.attachments.map((file, index) => (
                                                <Badge key={index} variant="outline" size="sm">
                                                    {file}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                        
                        {/* Instructions détaillées */}
                        <Alert icon={<IconAlertCircle size={16} />} color="blue">
                            <Text size="sm" fw={500} mb="xs">
                                Instructions:
                            </Text>
                            <Text size="sm">
                                {selectedHomework.instructions}
                            </Text>
                        </Alert>
                        
                        {/* Zone de remise */}
                        <Stack gap="md">
                            <Title order={4} size="h5">
                                Votre remise
                            </Title>
                            
                            <Textarea
                                label="Votre réponse"
                                placeholder="Rédigez votre réponse ici..."
                                value={submissionContent}
                                onChange={(e) => setSubmissionContent(e.target.value)}
                                minRows={8}
                                required
                            />
                            
                            <FileInput
                                label="Fichiers joints"
                                placeholder="Sélectionnez des fichiers à joindre..."
                                multiple
                                value={submissionFiles}
                                onChange={setSubmissionFiles}
                                leftSection={<IconUpload size={16} />}
                                description="Vous pouvez joindre plusieurs fichiers (PDF, images, documents...)"
                            />
                            
                            {submissionFiles.length > 0 && (
                                <Box>
                                    <Text size="sm" fw={500} mb="xs">
                                        Fichiers sélectionnés:
                                    </Text>
                                    <Group gap="xs">
                                        {submissionFiles.map((file, index) => (
                                            <Badge key={index} variant="light" size="sm">
                                                {file.name}
                                            </Badge>
                                        ))}
                                    </Group>
                                </Box>
                            )}
                        </Stack>
                        
                        <Group justify="flex-end" gap="sm">
                            <Button
                                variant="outline"
                                onClick={() => setSubmissionModalOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSubmitHomework}
                                disabled={!submissionContent.trim()}
                                leftSection={<IconUpload size={16} />}
                            >
                                Rendre le devoir
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </MainLayout>
    );
};

export default HomeworkSubmissionPage;