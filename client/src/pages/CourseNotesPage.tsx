import React, { useState } from 'react';
import {
    Title,
    Stack,
    Card,
    Text,
    Group,
    Badge,
    Button,
    TextInput,
    Select,
    ThemeIcon,
    ActionIcon,
    Menu,
    Box,
    Center,
    Loader,
    Divider,
    Tabs,
    SimpleGrid,
    Collapse,
    UnstyledButton,
    List,
} from '@mantine/core';
import {
    IconBook,
    IconCalendar,
    IconClock,
    IconUser,
    IconDownload,
    IconEye,
    IconEdit,
    IconSearch,
    IconSortAscending,
    IconSortDescending,
    IconBell,
    IconTarget,
    IconChevronDown,
    IconChevronUp,
    IconFileText,
    IconFile,
    IconFileWord,
    IconFileExcel,
    IconFilePower,
    IconPhoto,
    IconVideo,
    IconMusic,
    IconArchive,
    IconBookmark,
    IconBookmarkOff,
    IconHeart,
    IconHeartFilled,
    IconMessageCircle,
    IconShare2
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

// Types pour les données placeholder
interface CourseNote {
    id: string;
    title: string;
    description: string;
    subject: string;
    professor: {
        name: string;
        avatar: string;
        email: string;
    };
    course: {
        name: string;
        code: string;
        semester: string;
        year: string;
    };
    type: 'lecture' | 'exercise' | 'exam' | 'assignment' | 'resource' | 'announcement';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'published' | 'draft' | 'archived';
    publishedAt: string;
    updatedAt: string;
    attachments: {
        id: string;
        name: string;
        type: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'image' | 'video' | 'audio' | 'archive' | 'other';
        size: number;
        url: string;
        thumbnail?: string;
    }[];
    tags: string[];
    views: number;
    likes: number;
    isLiked: boolean;
    isBookmarked: boolean;
    comments: {
        id: string;
        author: {
            name: string;
            avatar: string;
        };
        content: string;
        createdAt: string;
        likes: number;
        isLiked: boolean;
    }[];
    accessLevel: 'public' | 'students' | 'enrolled' | 'private';
    requirements?: string;
    learningObjectives?: string[];
    relatedNotes: string[];
}

interface Course {
    id: string;
    name: string;
    code: string;
    professor: {
        name: string;
        avatar: string;
    };
    semester: string;
    year: string;
    enrolled: boolean;
    notesCount: number;
    lastUpdate: string;
}

// Données placeholder
const mockCourses: Course[] = [
    {
        id: '1',
        name: 'Algorithmes et Structures de Données',
        code: 'INF-101',
        professor: {
            name: 'Dr. Marie Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        semester: 'Printemps 2024',
        year: '2024',
        enrolled: true,
        notesCount: 24,
        lastUpdate: '2024-01-20T14:30:00'
    },
    {
        id: '2',
        name: 'Base de Données Relationnelles',
        code: 'INF-102',
        professor: {
            name: 'Prof. Pierre Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        semester: 'Printemps 2024',
        year: '2024',
        enrolled: true,
        notesCount: 18,
        lastUpdate: '2024-01-18T10:15:00'
    },
    {
        id: '3',
        name: 'Intelligence Artificielle',
        code: 'INF-201',
        professor: {
            name: 'Dr. Sophie Moreau',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        semester: 'Printemps 2024',
        year: '2024',
        enrolled: false,
        notesCount: 31,
        lastUpdate: '2024-01-22T16:45:00'
    }
];

const mockCourseNotes: CourseNote[] = [
    {
        id: '1',
        title: 'Introduction aux Algorithmes de Tri',
        description: 'Cours d\'introduction aux différents algorithmes de tri : tri à bulles, tri par insertion, tri rapide, tri par fusion. Complexité temporelle et spatiale.',
        subject: 'Algorithmes et Structures de Données',
        professor: {
            name: 'Dr. Marie Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            email: 'marie.dubois@university.edu'
        },
        course: {
            name: 'Algorithmes et Structures de Données',
            code: 'INF-101',
            semester: 'Printemps 2024',
            year: '2024'
        },
        type: 'lecture',
        priority: 'high',
        status: 'published',
        publishedAt: '2024-01-20T14:30:00',
        updatedAt: '2024-01-20T14:30:00',
        attachments: [
            {
                id: '1',
                name: 'cours_algorithmes_tri.pdf',
                type: 'pdf',
                size: 2048576,
                url: '/files/cours_algorithmes_tri.pdf',
                thumbnail: '/thumbnails/cours_algorithmes_tri.jpg'
            },
            {
                id: '2',
                name: 'exercices_tri.xlsx',
                type: 'xlsx',
                size: 512000,
                url: '/files/exercices_tri.xlsx'
            }
        ],
        tags: ['algorithmes', 'tri', 'complexité', 'programmation'],
        views: 156,
        likes: 23,
        isLiked: true,
        isBookmarked: false,
        comments: [
            {
                id: '1',
                author: {
                    name: 'Alexandre Petit',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                },
                content: 'Excellent cours ! Les exemples sont très clairs.',
                createdAt: '2024-01-21T09:15:00',
                likes: 5,
                isLiked: false
            }
        ],
        accessLevel: 'enrolled',
        learningObjectives: [
            'Comprendre les différents algorithmes de tri',
            'Analyser la complexité temporelle',
            'Implémenter les algorithmes en code'
        ],
        relatedNotes: ['2', '3']
    },
    {
        id: '2',
        title: 'Exercices Pratiques - Algorithmes de Tri',
        description: 'Série d\'exercices pour pratiquer l\'implémentation des algorithmes de tri vus en cours.',
        subject: 'Algorithmes et Structures de Données',
        professor: {
            name: 'Dr. Marie Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            email: 'marie.dubois@university.edu'
        },
        course: {
            name: 'Algorithmes et Structures de Données',
            code: 'INF-101',
            semester: 'Printemps 2024',
            year: '2024'
        },
        type: 'exercise',
        priority: 'medium',
        status: 'published',
        publishedAt: '2024-01-21T10:00:00',
        updatedAt: '2024-01-21T10:00:00',
        attachments: [
            {
                id: '3',
                name: 'exercices_algorithmes_tri.pdf',
                type: 'pdf',
                size: 1024000,
                url: '/files/exercices_algorithmes_tri.pdf'
            }
        ],
        tags: ['exercices', 'pratique', 'algorithmes', 'tri'],
        views: 89,
        likes: 12,
        isLiked: false,
        isBookmarked: true,
        comments: [],
        accessLevel: 'enrolled',
        learningObjectives: [
            'Pratiquer l\'implémentation des algorithmes',
            'Résoudre des problèmes de tri complexes'
        ],
        relatedNotes: ['1', '3']
    },
    {
        id: '3',
        title: 'Announcement: Examen du 15 Février',
        description: 'Rappel important : l\'examen d\'Algorithmes et Structures de Données aura lieu le 15 février à 14h00 en salle A201. Matériel autorisé : calculatrice et une feuille de notes manuscrite.',
        subject: 'Algorithmes et Structures de Données',
        professor: {
            name: 'Dr. Marie Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            email: 'marie.dubois@university.edu'
        },
        course: {
            name: 'Algorithmes et Structures de Données',
            code: 'INF-101',
            semester: 'Printemps 2024',
            year: '2024'
        },
        type: 'announcement',
        priority: 'urgent',
        status: 'published',
        publishedAt: '2024-01-22T08:00:00',
        updatedAt: '2024-01-22T08:00:00',
        attachments: [],
        tags: ['examen', 'important', 'rappel'],
        views: 203,
        likes: 8,
        isLiked: false,
        isBookmarked: true,
        comments: [
            {
                id: '2',
                author: {
                    name: 'Camille Moreau',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
                },
                content: 'Merci pour le rappel ! Quelle est la durée de l\'examen ?',
                createdAt: '2024-01-22T09:30:00',
                likes: 2,
                isLiked: true
            }
        ],
        accessLevel: 'enrolled',
        relatedNotes: ['1', '2']
    },
    {
        id: '4',
        title: 'Modélisation des Bases de Données',
        description: 'Cours sur la modélisation conceptuelle et logique des bases de données relationnelles. Diagrammes entité-association, normalisation, contraintes d\'intégrité.',
        subject: 'Base de Données Relationnelles',
        professor: {
            name: 'Prof. Pierre Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            email: 'pierre.martin@university.edu'
        },
        course: {
            name: 'Base de Données Relationnelles',
            code: 'INF-102',
            semester: 'Printemps 2024',
            year: '2024'
        },
        type: 'lecture',
        priority: 'high',
        status: 'published',
        publishedAt: '2024-01-18T10:15:00',
        updatedAt: '2024-01-18T10:15:00',
        attachments: [
            {
                id: '4',
                name: 'cours_modelisation_bdd.pdf',
                type: 'pdf',
                size: 3072000,
                url: '/files/cours_modelisation_bdd.pdf',
                thumbnail: '/thumbnails/cours_modelisation_bdd.jpg'
            },
            {
                id: '5',
                name: 'exemples_diagrammes_ea.pptx',
                type: 'pptx',
                size: 1536000,
                url: '/files/exemples_diagrammes_ea.pptx'
            }
        ],
        tags: ['bases de données', 'modélisation', 'diagrammes', 'normalisation'],
        views: 134,
        likes: 18,
        isLiked: true,
        isBookmarked: false,
        comments: [],
        accessLevel: 'enrolled',
        learningObjectives: [
            'Comprendre les concepts de modélisation',
            'Créer des diagrammes entité-association',
            'Appliquer les règles de normalisation'
        ],
        relatedNotes: []
    }
];

const CourseNotesPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [selectedNote, setSelectedNote] = useState<CourseNote | null>(null);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all-notes');
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [courseFilter, setCourseFilter] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'date' | 'title' | 'views' | 'likes'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'lecture': return 'blue';
            case 'exercise': return 'green';
            case 'exam': return 'red';
            case 'assignment': return 'orange';
            case 'resource': return 'purple';
            case 'announcement': return 'yellow';
            default: return 'gray';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'lecture': return 'Cours';
            case 'exercise': return 'Exercices';
            case 'exam': return 'Examen';
            case 'assignment': return 'Devoir';
            case 'resource': return 'Ressource';
            case 'announcement': return 'Annonce';
            default: return 'Inconnu';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'lecture': return IconBook;
            case 'exercise': return IconTarget;
            case 'exam': return IconFileText;
            case 'assignment': return IconEdit;
            case 'resource': return IconFile;
            case 'announcement': return IconBell;
            default: return IconFile;
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return IconFile;
            case 'doc':
            case 'docx': return IconFileWord;
            case 'xls':
            case 'xlsx': return IconFileExcel;
            case 'ppt':
            case 'pptx': return IconFilePower;
            case 'image': return IconPhoto;
            case 'video': return IconVideo;
            case 'audio': return IconMusic;
            case 'archive': return IconArchive;
            default: return IconFile;
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const toggleCardExpansion = (noteId: string) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(noteId)) {
            newExpanded.delete(noteId);
        } else {
            newExpanded.add(noteId);
        }
        setExpandedCards(newExpanded);
    };

    const getFilteredNotes = () => {
        let filtered = [...mockCourseNotes];

        // Filtrage par recherche
        if (searchQuery) {
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filtrage par type
        if (typeFilter) {
            filtered = filtered.filter(note => note.type === typeFilter);
        }

        // Filtrage par cours
        if (courseFilter) {
            filtered = filtered.filter(note => note.course.code === courseFilter);
        }

        // Tri
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'views':
                    comparison = a.views - b.views;
                    break;
                case 'likes':
                    comparison = a.likes - b.likes;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    };

    const getEnrolledCourses = () => {
        return mockCourses.filter(course => course.enrolled);
    };

    const getNoteStats = () => {
        const enrolledCourses = getEnrolledCourses();
        const totalNotes = mockCourseNotes.filter(note =>
            enrolledCourses.some(course => course.code === note.course.code)
        ).length;
        const lectures = mockCourseNotes.filter(note => note.type === 'lecture').length;
        const exercises = mockCourseNotes.filter(note => note.type === 'exercise').length;
        const announcements = mockCourseNotes.filter(note => note.type === 'announcement').length;

        return { totalNotes, lectures, exercises, announcements };
    };

    const stats = getNoteStats();
    const filteredNotes = getFilteredNotes();
    const enrolledCourses = getEnrolledCourses();

    return (
        <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
            {/* En-tête */}
            <Group justify="space-between" align="center" mb="xl">
                <Group>
                    <ThemeIcon size={40} radius="md" color="violet">
                        <IconBook size={24} />
                    </ThemeIcon>
                    <div>
                        <Title order={1} size="h2">
                            Notes de cours
                        </Title>
                        <Text c="dimmed" size="sm">
                            Documents et ressources partagés par vos professeurs
                        </Text>
                    </div>
                </Group>
            </Group>

            <Stack gap="xl">

                {/* Statistiques des notes */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" c="dimmed" fw={500}>Total notes</Text>
                                <Text size="2xl" fw={800} c="blue">
                                    {stats.totalNotes}
                                </Text>
                            </div>
                            <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                                <IconBook size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" c="dimmed" fw={500}>Cours</Text>
                                <Text size="2xl" fw={800} c="green">
                                    {stats.lectures}
                                </Text>
                            </div>
                            <ThemeIcon size="xl" radius="xl" color="green" variant="light">
                                <IconFileText size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" c="dimmed" fw={500}>Exercices</Text>
                                <Text size="2xl" fw={800} c="orange">
                                    {stats.exercises}
                                </Text>
                            </div>
                            <ThemeIcon size="xl" radius="xl" color="orange" variant="light">
                                <IconTarget size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder p="lg" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" c="dimmed" fw={500}>Annonces</Text>
                                <Text size="2xl" fw={800} c="yellow">
                                    {stats.announcements}
                                </Text>
                            </div>
                            <ThemeIcon size="xl" radius="xl" color="yellow" variant="light">
                                <IconBell size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Interface des notes avec onglets */}
                <Card withBorder p="lg" radius="md">
                    <Group justify="space-between" align="center" mb="lg">
                        <Title order={2} size="h3">Documents de cours</Title>
                        <Group gap="md">
                            <TextInput
                                placeholder="Rechercher une note..."
                                leftSection={<IconSearch size={16} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: 250 }}
                            />
                            <Select
                                placeholder="Type"
                                data={[
                                    { value: 'lecture', label: 'Cours' },
                                    { value: 'exercise', label: 'Exercices' },
                                    { value: 'exam', label: 'Examen' },
                                    { value: 'assignment', label: 'Devoir' },
                                    { value: 'resource', label: 'Ressource' },
                                    { value: 'announcement', label: 'Annonce' }
                                ]}
                                value={typeFilter}
                                onChange={setTypeFilter}
                                clearable
                            />
                            <Select
                                placeholder="Cours"
                                data={enrolledCourses.map(course => ({
                                    value: course.code,
                                    label: `${course.code} - ${course.name}`
                                }))}
                                value={courseFilter}
                                onChange={setCourseFilter}
                                clearable
                            />
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <Button variant="outline" leftSection={<IconSortAscending size={16} />}>
                                        Trier par {sortBy === 'date' ? 'date' : sortBy === 'title' ? 'titre' : sortBy === 'views' ? 'vues' : 'likes'}
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconCalendar size={14} />}
                                        onClick={() => setSortBy('date')}
                                    >
                                        Par date
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconFileText size={14} />}
                                        onClick={() => setSortBy('title')}
                                    >
                                        Par titre
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconEye size={14} />}
                                        onClick={() => setSortBy('views')}
                                    >
                                        Par vues
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconHeart size={14} />}
                                        onClick={() => setSortBy('likes')}
                                    >
                                        Par likes
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                        leftSection={sortOrder === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />}
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                    </Group>

                    <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all-notes')}>
                        <Tabs.List>
                            <Tabs.Tab value="all-notes" leftSection={<IconBook size={16} />}>
                                Toutes les notes ({filteredNotes.length})
                            </Tabs.Tab>
                            <Tabs.Tab value="bookmarked" leftSection={<IconBookmark size={16} />}>
                                Favoris ({mockCourseNotes.filter(note => note.isBookmarked).length})
                            </Tabs.Tab>
                            <Tabs.Tab value="recent" leftSection={<IconClock size={16} />}>
                                Récentes ({mockCourseNotes.filter(note => {
                                    const noteDate = new Date(note.publishedAt);
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return noteDate > weekAgo;
                                }).length})
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="all-notes" pt="lg">
                            <Stack gap="md">
                                {filteredNotes.map((note) => {
                                    const isExpanded = expandedCards.has(note.id);
                                    const TypeIcon = getTypeIcon(note.type);

                                    return (
                                        <Card key={note.id} withBorder shadow="sm" radius="lg">
                                            <UnstyledButton
                                                onClick={() => toggleCardExpansion(note.id)}
                                                style={{ width: '100%' }}
                                            >
                                                <Group justify="space-between" align="flex-start" p="md">
                                                    <div style={{ flex: 1 }}>
                                                        <Group gap="sm" mb="xs">
                                                            <TypeIcon size={20} color={`var(--mantine-color-${getTypeColor(note.type)}-6)`} />
                                                            <Title order={3} size="h4">
                                                                {note.title}
                                                            </Title>
                                                            <Badge
                                                                color={getTypeColor(note.type)}
                                                                variant="light"
                                                                size="lg"
                                                            >
                                                                {getTypeLabel(note.type)}
                                                            </Badge>
                                                            {note.priority === 'urgent' && (
                                                                <Badge color="red" variant="filled" size="sm">
                                                                    URGENT
                                                                </Badge>
                                                            )}
                                                        </Group>

                                                        <Text size="sm" c="dimmed" mb="sm" lineClamp={2}>
                                                            {note.description}
                                                        </Text>

                                                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                                                            <Group gap="xs">
                                                                <IconUser size={16} color="var(--mantine-color-blue-6)" />
                                                                <div>
                                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                                                        Professeur
                                                                    </Text>
                                                                    <Text size="sm" fw={500}>
                                                                        {note.professor.name}
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                            <Group gap="xs">
                                                                <IconCalendar size={16} color="var(--mantine-color-green-6)" />
                                                                <div>
                                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                                                        Publié
                                                                    </Text>
                                                                    <Text size="sm" fw={500}>
                                                                        {formatDate(note.publishedAt)}
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                            <Group gap="xs">
                                                                <IconEye size={16} color="var(--mantine-color-purple-6)" />
                                                                <div>
                                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                                                        Vues
                                                                    </Text>
                                                                    <Text size="sm" fw={500}>
                                                                        {note.views}
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                            <Group gap="xs">
                                                                <IconHeart size={16} color="var(--mantine-color-red-6)" />
                                                                <div>
                                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                                                        Likes
                                                                    </Text>
                                                                    <Text size="sm" fw={500}>
                                                                        {note.likes}
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                        </SimpleGrid>
                                                    </div>

                                                    <Group gap="sm">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="gray"
                                                            size="lg"
                                                            radius="xl"
                                                        >
                                                            {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>
                                            </UnstyledButton>

                                            <Collapse in={isExpanded}>
                                                <Box p="md" pt={0}>
                                                    <Divider mb="md" />

                                                    {/* Fichiers joints */}
                                                    {note.attachments.length > 0 && (
                                                        <Box mb="md">
                                                            <Text size="sm" fw={600} mb="xs">Fichiers joints</Text>
                                                            <Stack gap="xs">
                                                                {note.attachments.map((attachment) => {
                                                                    const FileIcon = getFileIcon(attachment.type);
                                                                    return (
                                                                        <Group key={attachment.id} justify="space-between" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-sm)' }}>
                                                                            <Group gap="sm">
                                                                                <FileIcon size={20} color={`var(--mantine-color-${getTypeColor(note.type)}-6)`} />
                                                                                <div>
                                                                                    <Text size="sm" fw={500}>{attachment.name}</Text>
                                                                                    <Text size="xs" c="dimmed">{formatFileSize(attachment.size)}</Text>
                                                                                </div>
                                                                            </Group>
                                                                            <Group gap="xs">
                                                                                <ActionIcon variant="subtle" color="blue" size="sm">
                                                                                    <IconDownload size={16} />
                                                                                </ActionIcon>
                                                                                <ActionIcon variant="subtle" color="gray" size="sm">
                                                                                    <IconEye size={16} />
                                                                                </ActionIcon>
                                                                            </Group>
                                                                        </Group>
                                                                    );
                                                                })}
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    {/* Tags */}
                                                    {note.tags.length > 0 && (
                                                        <Box mb="md">
                                                            <Text size="sm" fw={600} mb="xs">Tags</Text>
                                                            <Group gap="xs">
                                                                {note.tags.map((tag, index) => (
                                                                    <Badge key={index} variant="outline" size="sm">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </Group>
                                                        </Box>
                                                    )}

                                                    {/* Objectifs d'apprentissage */}
                                                    {note.learningObjectives && note.learningObjectives.length > 0 && (
                                                        <Box mb="md">
                                                            <Text size="sm" fw={600} mb="xs">Objectifs d'apprentissage</Text>
                                                            <List size="sm" spacing="xs">
                                                                {note.learningObjectives.map((objective, index) => (
                                                                    <List.Item key={index}>{objective}</List.Item>
                                                                ))}
                                                            </List>
                                                        </Box>
                                                    )}

                                                    {/* Actions */}
                                                    <Group justify="space-between">
                                                        <Group gap="xs">
                                                            <ActionIcon
                                                                variant={note.isLiked ? "filled" : "subtle"}
                                                                color={note.isLiked ? "red" : "gray"}
                                                                size="sm"
                                                            >
                                                                {note.isLiked ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                                                            </ActionIcon>
                                                            <ActionIcon
                                                                variant={note.isBookmarked ? "filled" : "subtle"}
                                                                color={note.isBookmarked ? "yellow" : "gray"}
                                                                size="sm"
                                                            >
                                                                {note.isBookmarked ? <IconBookmark size={16} /> : <IconBookmarkOff size={16} />}
                                                            </ActionIcon>
                                                            <ActionIcon variant="subtle" color="gray" size="sm">
                                                                <IconMessageCircle size={16} />
                                                            </ActionIcon>
                                                            <ActionIcon variant="subtle" color="gray" size="sm">
                                                                <IconShare2 size={16} />
                                                            </ActionIcon>
                                                        </Group>

                                                        <Button
                                                            size="sm"
                                                            leftSection={<IconDownload size={16} />}
                                                        >
                                                            Télécharger
                                                        </Button>
                                                    </Group>
                                                </Box>
                                            </Collapse>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="bookmarked" pt="lg">
                            <Stack gap="md">
                                {mockCourseNotes
                                    .filter(note => note.isBookmarked)
                                    .map((note) => (
                                        <Card key={note.id} withBorder shadow="sm" radius="lg">
                                            <Group justify="space-between" align="flex-start" p="md">
                                                <div style={{ flex: 1 }}>
                                                    <Group gap="sm" mb="xs">
                                                        <Title order={3} size="h4">
                                                            {note.title}
                                                        </Title>
                                                        <Badge
                                                            color={getTypeColor(note.type)}
                                                            variant="light"
                                                        >
                                                            {getTypeLabel(note.type)}
                                                        </Badge>
                                                    </Group>

                                                    <Text size="sm" c="dimmed" mb="sm">
                                                        {note.description}
                                                    </Text>

                                                    <Group gap="lg" mb="sm">
                                                        <Group gap="xs">
                                                            <IconUser size={16} />
                                                            <Text size="sm">
                                                                {note.professor.name}
                                                            </Text>
                                                        </Group>
                                                        <Group gap="xs">
                                                            <IconCalendar size={16} />
                                                            <Text size="sm">
                                                                {formatDate(note.publishedAt)}
                                                            </Text>
                                                        </Group>
                                                        <Group gap="xs">
                                                            <IconEye size={16} />
                                                            <Text size="sm">
                                                                {note.views} vues
                                                            </Text>
                                                        </Group>
                                                    </Group>
                                                </div>

                                                <Group gap="sm">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        leftSection={<IconEye size={16} />}
                                                    >
                                                        Voir
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        leftSection={<IconDownload size={16} />}
                                                    >
                                                        Télécharger
                                                    </Button>
                                                </Group>
                                            </Group>
                                        </Card>
                                    ))}
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="recent" pt="lg">
                            <Stack gap="md">
                                {mockCourseNotes
                                    .filter(note => {
                                        const noteDate = new Date(note.publishedAt);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return noteDate > weekAgo;
                                    })
                                    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                                    .map((note) => (
                                        <Card key={note.id} withBorder shadow="sm" radius="lg">
                                            <Group justify="space-between" align="flex-start" p="md">
                                                <div style={{ flex: 1 }}>
                                                    <Group gap="sm" mb="xs">
                                                        <Title order={3} size="h4">
                                                            {note.title}
                                                        </Title>
                                                        <Badge
                                                            color={getTypeColor(note.type)}
                                                            variant="light"
                                                        >
                                                            {getTypeLabel(note.type)}
                                                        </Badge>
                                                        <Badge color="green" variant="light" size="sm">
                                                            Nouveau
                                                        </Badge>
                                                    </Group>

                                                    <Text size="sm" c="dimmed" mb="sm">
                                                        {note.description}
                                                    </Text>

                                                    <Group gap="lg" mb="sm">
                                                        <Group gap="xs">
                                                            <IconUser size={16} />
                                                            <Text size="sm">
                                                                {note.professor.name}
                                                            </Text>
                                                        </Group>
                                                        <Group gap="xs">
                                                            <IconCalendar size={16} />
                                                            <Text size="sm">
                                                                {formatDate(note.publishedAt)}
                                                            </Text>
                                                        </Group>
                                                        <Group gap="xs">
                                                            <IconEye size={16} />
                                                            <Text size="sm">
                                                                {note.views} vues
                                                            </Text>
                                                        </Group>
                                                    </Group>
                                                </div>

                                                <Group gap="sm">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        leftSection={<IconEye size={16} />}
                                                    >
                                                        Voir
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        leftSection={<IconDownload size={16} />}
                                                    >
                                                        Télécharger
                                                    </Button>
                                                </Group>
                                            </Group>
                                        </Card>
                                    ))}
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                </Card>
            </Stack>
        </MainLayout>
    );
};

export default CourseNotesPage;
