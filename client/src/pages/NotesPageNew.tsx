import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Group,
    ThemeIcon,
    Stack,
    Card,
    Text,
    Button,
    Grid,
    Badge,
    Modal,
    TextInput,
    Textarea,
    ActionIcon,
    Tooltip,
    Box,
    SimpleGrid,
    Paper,
    Divider,
    Center,
    Loader,
    Menu,
    Alert,
    Tabs,
    ScrollArea,
    Flex,
    Select
} from '@mantine/core';
import {
    IconNotes,
    IconPlus,
    IconEdit,
    IconTrash,
    IconSearch,
    IconTag,
    IconStar,
    IconStarFilled,
    IconDots,
    IconPin,
    IconPinFilled,
    IconArchive,
    IconShare,
    IconCopy,
    IconDownload,
    IconFilter,
    IconSortAscending,
    IconSortDescending,
    IconCalendar,
    IconClock,
    IconFolder,
    IconFolderPlus
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isStarred: boolean;
    isArchived: boolean;
    folder?: string;
    createdAt: Date;
    modifiedAt: Date;
    color?: string;
    wordCount: number;
}

interface Folder {
    id: string;
    name: string;
    color: string;
    noteCount: number;
    createdAt: Date;
}

const NotesPageNew: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'modified' | 'created' | 'title'>('modified');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [modalOpened, setModalOpened] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');

    // État du formulaire
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        folder: '',
        color: '#ffffff',
    });

    // Données placeholder
    useEffect(() => {
        const mockNotes: Note[] = [
            {
                id: '1',
                title: 'Notes de cours - Mathématiques',
                content: 'Les équations du second degré sont de la forme ax² + bx + c = 0. Le discriminant Δ = b² - 4ac détermine la nature des solutions...',
                tags: ['maths', 'cours', 'équations'],
                isPinned: true,
                isStarred: false,
                isArchived: false,
                folder: 'Cours',
                createdAt: new Date('2024-01-15'),
                modifiedAt: new Date('2024-01-20'),
                color: '#fff3cd',
                wordCount: 150
            },
            {
                id: '2',
                title: 'Idées pour le projet final',
                content: 'Créer une application web moderne avec React et TypeScript. Intégrer une base de données PostgreSQL et un système d\'authentification...',
                tags: ['projet', 'web', 'react'],
                isPinned: false,
                isStarred: true,
                isArchived: false,
                folder: 'Projets',
                createdAt: new Date('2024-01-10'),
                modifiedAt: new Date('2024-01-18'),
                color: '#d1ecf1',
                wordCount: 200
            },
            {
                id: '3',
                title: 'Liste de tâches - Semaine',
                content: '1. Finir le rapport de stage\n2. Préparer la présentation\n3. Réviser pour l\'examen de physique\n4. Appeler le professeur',
                tags: ['tâches', 'organisation'],
                isPinned: false,
                isStarred: false,
                isArchived: false,
                folder: 'Personnel',
                createdAt: new Date('2024-01-12'),
                modifiedAt: new Date('2024-01-19'),
                color: '#f8d7da',
                wordCount: 45
            },
            {
                id: '4',
                title: 'Recette de cookies',
                content: 'Ingrédients:\n- 200g de farine\n- 100g de beurre\n- 80g de sucre\n- 1 œuf\n\nInstructions: Mélanger tous les ingrédients...',
                tags: ['cuisine', 'recette'],
                isPinned: false,
                isStarred: false,
                isArchived: true,
                folder: 'Cuisine',
                createdAt: new Date('2024-01-05'),
                modifiedAt: new Date('2024-01-05'),
                color: '#d4edda',
                wordCount: 80
            }
        ];

        const mockFolders: Folder[] = [
            { id: '1', name: 'Cours', color: '#667eea', noteCount: 1, createdAt: new Date('2024-01-01') },
            { id: '2', name: 'Projets', color: '#f093fb', noteCount: 1, createdAt: new Date('2024-01-02') },
            { id: '3', name: 'Personnel', color: '#4facfe', noteCount: 1, createdAt: new Date('2024-01-03') },
            { id: '4', name: 'Cuisine', color: '#43e97b', noteCount: 1, createdAt: new Date('2024-01-04') }
        ];

        setNotes(mockNotes);
        setFolders(mockFolders);
    }, []);

    // Filtrage et tri des notes
    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesTab = activeTab === 'all' || 
                          (activeTab === 'starred' && note.isStarred) ||
                          (activeTab === 'pinned' && note.isPinned) ||
                          (activeTab === 'archived' && note.isArchived);
        
        const matchesFolder = !selectedFolder || note.folder === selectedFolder;
        
        return matchesSearch && matchesTab && matchesFolder;
    });

    const sortedNotes = [...filteredNotes].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
            case 'created':
                comparison = a.createdAt.getTime() - b.createdAt.getTime();
                break;
            case 'modified':
            default:
                comparison = a.modifiedAt.getTime() - b.modifiedAt.getTime();
                break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Handlers
    const handleCreateNote = () => {
        setEditingNote(null);
        setFormData({
            title: '',
            content: '',
            tags: '',
            folder: '',
            color: '#ffffff',
        });
        setModalOpened(true);
    };

    const handleEditNote = (note: Note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            tags: note.tags.join(', '),
            folder: note.folder || '',
            color: note.color || '#ffffff',
        });
        setModalOpened(true);
    };

    const handleSaveNote = () => {
        if (!formData.title.trim()) return;

        const newNote: Note = {
            id: editingNote?.id || Date.now().toString(),
            title: formData.title,
            content: formData.content,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            isPinned: editingNote?.isPinned || false,
            isStarred: editingNote?.isStarred || false,
            isArchived: editingNote?.isArchived || false,
            folder: formData.folder || undefined,
            createdAt: editingNote?.createdAt || new Date(),
            modifiedAt: new Date(),
            color: formData.color,
            wordCount: formData.content.split(' ').length
        };

        if (editingNote) {
            setNotes(notes.map(note => note.id === editingNote.id ? newNote : note));
        } else {
            setNotes([newNote, ...notes]);
        }

        setModalOpened(false);
        setEditingNote(null);
    };

    const handleDeleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id));
        if (selectedNote?.id === id) {
            setSelectedNote(null);
        }
    };

    const handleToggleStar = (id: string) => {
        setNotes(notes.map(note => 
            note.id === id ? { ...note, isStarred: !note.isStarred } : note
        ));
    };

    const handleTogglePin = (id: string) => {
        setNotes(notes.map(note => 
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
        ));
    };

    const handleArchiveNote = (id: string) => {
        setNotes(notes.map(note => 
            note.id === id ? { ...note, isArchived: !note.isArchived } : note
        ));
    };

    const handleShareNote = (id: string) => {
        // Logique de partage
        console.log('Partager la note:', id);
    };

    const handleDuplicateNote = (id: string) => {
        const note = notes.find(n => n.id === id);
        if (note) {
            const duplicatedNote = {
                ...note,
                id: Date.now().toString(),
                title: `${note.title} (Copie)`,
                createdAt: new Date(),
                modifiedAt: new Date()
            };
            setNotes([duplicatedNote, ...notes]);
        }
    };

    const handleExportNote = (id: string) => {
        // Logique d'export
        console.log('Exporter la note:', id);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader color="violet" size="lg" />
                </Center>
            </MainLayout>
        );
    }

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
            {/* En-tête moderne */}
            <Box mb="xl" p="lg" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                color: 'white'
            }}>
                <Group justify="space-between" align="center">
                    <Group>
                        <ThemeIcon size={48} radius="lg" color="white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <IconNotes size={28} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h1" c="white">
                                Mes Notes
                            </Title>
                            <Text c="rgba(255,255,255,0.8)" size="md">
                                Organisez vos idées et vos pensées
                            </Text>
                        </div>
                    </Group>
                    <Group gap="md">
                        <Button
                            leftSection={<IconFolderPlus size={18} />}
                            variant="white"
                            color="dark"
                            size="md"
                            radius="xl"
                        >
                            Nouveau dossier
                        </Button>
                        <Button
                            leftSection={<IconPlus size={18} />}
                            onClick={handleCreateNote}
                            variant="filled"
                            color="white"
                            size="md"
                            radius="xl"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
                        >
                            Nouvelle note
                        </Button>
                    </Group>
                </Group>
            </Box>

            {/* Interface 3 colonnes moderne */}
            <Grid gutter="lg">
                {/* Colonne 1: Filtres et navigation */}
                <Grid.Col span={3}>
                    <Stack gap="md">
                        {/* Barre de recherche moderne */}
                        <Paper p="lg" radius="lg" shadow="sm" withBorder>
                            <TextInput
                                placeholder="Rechercher dans vos notes..."
                                leftSection={<IconSearch size={18} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="md"
                                radius="xl"
                                styles={{
                                    input: {
                                        border: '2px solid #e9ecef',
                                        '&:focus': {
                                            borderColor: '#667eea'
                                        }
                                    }
                                }}
                            />
                        </Paper>

                        {/* Onglets de filtrage */}
                        <Paper p="lg" radius="lg" shadow="sm" withBorder>
                            <Text fw={600} size="lg" mb="md" c="dark">Filtres</Text>
                            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')} orientation="vertical">
                                <Tabs.List style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                    <Tabs.Tab 
                                        value="all" 
                                        leftSection={<IconNotes size={16} />}
                                        style={{ justifyContent: 'flex-start', marginBottom: '8px' }}
                                    >
                                        Toutes les notes
                                    </Tabs.Tab>
                                    <Tabs.Tab 
                                        value="starred" 
                                        leftSection={<IconStarFilled size={16} />}
                                        style={{ justifyContent: 'flex-start', marginBottom: '8px' }}
                                    >
                                        Favorites
                                    </Tabs.Tab>
                                    <Tabs.Tab 
                                        value="pinned" 
                                        leftSection={<IconPinFilled size={16} />}
                                        style={{ justifyContent: 'flex-start', marginBottom: '8px' }}
                                    >
                                        Épinglées
                                    </Tabs.Tab>
                                    <Tabs.Tab 
                                        value="archived" 
                                        leftSection={<IconArchive size={16} />}
                                        style={{ justifyContent: 'flex-start' }}
                                    >
                                        Archivées
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs>
                        </Paper>

                        {/* Dossiers */}
                        <Paper p="lg" radius="lg" shadow="sm" withBorder>
                            <Group justify="space-between" mb="md">
                                <Text fw={600} size="lg" c="dark">Dossiers</Text>
                                <ActionIcon variant="light" color="violet" size="sm">
                                    <IconFolderPlus size={16} />
                                </ActionIcon>
                            </Group>
                            <Stack gap="xs">
                                <Button
                                    variant={selectedFolder === null ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconFolder size={16} />}
                                    onClick={() => setSelectedFolder(null)}
                                    size="md"
                                    radius="xl"
                                >
                                    Tous les dossiers
                                </Button>
                                {folders.map(folder => (
                                    <Button
                                        key={folder.id}
                                        variant={selectedFolder === folder.name ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconFolder size={16} />}
                                        onClick={() => setSelectedFolder(folder.name)}
                                        size="md"
                                        radius="xl"
                                    >
                                        {folder.name} ({folder.noteCount})
                                    </Button>
                                ))}
                            </Stack>
                        </Paper>

                        {/* Options de tri */}
                        <Paper p="lg" radius="lg" shadow="sm" withBorder>
                            <Text fw={600} size="lg" mb="md" c="dark">Trier par</Text>
                            <Stack gap="xs">
                                <Button
                                    variant={sortBy === 'modified' ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconClock size={16} />}
                                    onClick={() => setSortBy('modified')}
                                    size="md"
                                    radius="xl"
                                >
                                    Date de modification
                                </Button>
                                <Button
                                    variant={sortBy === 'created' ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconCalendar size={16} />}
                                    onClick={() => setSortBy('created')}
                                    size="md"
                                    radius="xl"
                                >
                                    Date de création
                                </Button>
                                <Button
                                    variant={sortBy === 'title' ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconSortAscending size={16} />}
                                    onClick={() => setSortBy('title')}
                                    size="md"
                                    radius="xl"
                                >
                                    Titre
                                </Button>
                                <Button
                                    variant="subtle"
                                    justify="flex-start"
                                    leftSection={sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    size="md"
                                    radius="xl"
                                >
                                    {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>

                {/* Colonne 2: Liste des notes */}
                <Grid.Col span={4}>
                    <Paper p="lg" radius="lg" shadow="sm" withBorder h="100%">
                        <Group justify="space-between" mb="lg">
                            <Text fw={600} size="lg" c="dark">
                                {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''}
                            </Text>
                            <Group gap="xs">
                                <ActionIcon variant="light" color="gray" size="sm">
                                    <IconFilter size={16} />
                                </ActionIcon>
                                <ActionIcon variant="light" color="gray" size="sm">
                                    <IconSortAscending size={16} />
                                </ActionIcon>
                            </Group>
                        </Group>
                        
                        <ScrollArea h="calc(100vh - 300px)">
                            <Stack gap="md">
                                {sortedNotes.map(note => (
                                    <Paper
                                        key={note.id}
                                        p="lg"
                                        radius="lg"
                                        style={{
                                            cursor: 'pointer',
                                            border: selectedNote?.id === note.id ? '2px solid #667eea' : '1px solid #e9ecef',
                                            backgroundColor: note.color || '#ffffff',
                                            transition: 'all 0.2s ease',
                                            boxShadow: selectedNote?.id === note.id ? '0 8px 25px rgba(102, 126, 234, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
                                        }}
                                        onClick={() => setSelectedNote(note)}
                                        onMouseEnter={(e) => {
                                            if (selectedNote?.id !== note.id) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedNote?.id !== note.id) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                                            }
                                        }}
                                    >
                                        <Group justify="space-between" align="flex-start" mb="md">
                                            <Text fw={600} size="md" truncate style={{ flex: 1 }}>
                                                {note.title}
                                            </Text>
                                            <Group gap="xs">
                                                {note.isPinned && (
                                                    <IconPinFilled size={16} color="#667eea" />
                                                )}
                                                {note.isStarred && (
                                                    <IconStarFilled size={16} color="#f39c12" />
                                                )}
                                                <Menu>
                                                    <Menu.Target>
                                                        <ActionIcon size="sm" variant="subtle" color="gray">
                                                            <IconDots size={14} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown>
                                                        <Menu.Item
                                                            leftSection={<IconEdit size={16} />}
                                                            onClick={() => handleEditNote(note)}
                                                        >
                                                            Modifier
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={note.isStarred ? <IconStar size={16} /> : <IconStarFilled size={16} />}
                                                            onClick={() => handleToggleStar(note.id)}
                                                        >
                                                            {note.isStarred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={note.isPinned ? <IconPin size={16} /> : <IconPinFilled size={16} />}
                                                            onClick={() => handleTogglePin(note.id)}
                                                        >
                                                            {note.isPinned ? 'Désépingler' : 'Épingler'}
                                                        </Menu.Item>
                                                        <Menu.Divider />
                                                        <Menu.Item
                                                            leftSection={<IconArchive size={16} />}
                                                            onClick={() => handleArchiveNote(note.id)}
                                                        >
                                                            {note.isArchived ? 'Désarchiver' : 'Archiver'}
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={<IconTrash size={16} />}
                                                            color="red"
                                                            onClick={() => handleDeleteNote(note.id)}
                                                        >
                                                            Supprimer
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Group>
                                        <Text size="sm" c="dimmed" lineClamp={3} mb="md" style={{ lineHeight: 1.5 }}>
                                            {note.content}
                                        </Text>
                                        <Group justify="space-between" align="center">
                                            <Group gap="xs">
                                                {note.tags.slice(0, 3).map(tag => (
                                                    <Badge key={tag} size="sm" variant="light" color="violet" radius="xl">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {note.tags.length > 3 && (
                                                    <Badge size="sm" variant="light" color="gray" radius="xl">
                                                        +{note.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </Group>
                                            <Text size="xs" c="dimmed">
                                                {formatDate(note.modifiedAt)}
                                            </Text>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        </ScrollArea>
                    </Paper>
                </Grid.Col>

                {/* Colonne 3: Aperçu de la note */}
                <Grid.Col span={5}>
                    <Paper p="lg" radius="lg" shadow="sm" withBorder h="100%">
                        {selectedNote ? (
                            <Stack gap="lg" h="100%">
                                <Group justify="space-between" align="flex-start">
                                    <div style={{ flex: 1 }}>
                                        <Group gap="xs" mb="md">
                                            {selectedNote.isPinned && (
                                                <IconPinFilled size={18} color="#667eea" />
                                            )}
                                            {selectedNote.isStarred && (
                                                <IconStarFilled size={18} color="#f39c12" />
                                            )}
                                            <Text fw={700} size="xl" c="dark">
                                                {selectedNote.title}
                                            </Text>
                                        </Group>
                                        <Group gap="xs" mb="lg">
                                            {selectedNote.tags.map(tag => (
                                                <Badge key={tag} size="md" variant="light" color="violet" radius="xl">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </div>
                                    <Group gap="xs">
                                        <ActionIcon
                                            variant="light"
                                            color="violet"
                                            size="lg"
                                            radius="xl"
                                            onClick={() => handleEditNote(selectedNote)}
                                        >
                                            <IconEdit size={18} />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="light"
                                            color="violet"
                                            size="lg"
                                            radius="xl"
                                            onClick={() => handleToggleStar(selectedNote.id)}
                                        >
                                            {selectedNote.isStarred ? <IconStar size={18} /> : <IconStarFilled size={18} />}
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="light"
                                            color="violet"
                                            size="lg"
                                            radius="xl"
                                            onClick={() => handleTogglePin(selectedNote.id)}
                                        >
                                            {selectedNote.isPinned ? <IconPin size={18} /> : <IconPinFilled size={18} />}
                                        </ActionIcon>
                                        <Menu>
                                            <Menu.Target>
                                                <ActionIcon variant="light" color="violet" size="lg" radius="xl">
                                                    <IconDots size={18} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    leftSection={<IconShare size={16} />}
                                                    onClick={() => handleShareNote(selectedNote.id)}
                                                >
                                                    Partager
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconCopy size={16} />}
                                                    onClick={() => handleDuplicateNote(selectedNote.id)}
                                                >
                                                    Dupliquer
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconDownload size={16} />}
                                                    onClick={() => handleExportNote(selectedNote.id)}
                                                >
                                                    Exporter
                                                </Menu.Item>
                                                <Menu.Divider />
                                                <Menu.Item
                                                    leftSection={<IconArchive size={16} />}
                                                    onClick={() => handleArchiveNote(selectedNote.id)}
                                                >
                                                    {selectedNote.isArchived ? 'Désarchiver' : 'Archiver'}
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconTrash size={16} />}
                                                    color="red"
                                                    onClick={() => handleDeleteNote(selectedNote.id)}
                                                >
                                                    Supprimer
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Group>
                                </Group>
                                
                                <Divider />
                                
                                <ScrollArea style={{ flex: 1 }}>
                                    <Text size="md" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                        {selectedNote.content}
                                    </Text>
                                </ScrollArea>
                                
                                <Divider />
                                
                                <Group justify="space-between" align="center">
                                    <Text size="sm" c="dimmed">
                                        Créé le {formatDate(selectedNote.createdAt)} • Modifié le {formatDate(selectedNote.modifiedAt)}
                                    </Text>
                                    <Badge size="sm" variant="light" color="gray" radius="xl">
                                        {selectedNote.wordCount} mots
                                    </Badge>
                                </Group>
                            </Stack>
                        ) : (
                            <Center h="100%">
                                <Stack align="center" gap="lg">
                                    <Box
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                                        }}
                                    >
                                        <IconNotes size={60} color="white" />
                                    </Box>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text fw={600} size="xl" c="dark" mb="xs">
                                            Sélectionnez une note
                                        </Text>
                                        <Text c="dimmed" size="md" style={{ maxWidth: '300px', lineHeight: 1.6 }}>
                                            Choisissez une note dans la liste pour la consulter et la modifier
                                        </Text>
                                    </div>
                                </Stack>
                            </Center>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Modal de création/édition de note */}
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={editingNote ? 'Modifier la note' : 'Nouvelle note'}
                size="lg"
                centered
            >
                <Stack gap="md">
                    <TextInput
                        label="Titre"
                        placeholder="Titre de la note"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    
                    <Textarea
                        label="Contenu"
                        placeholder="Contenu de la note"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        minRows={6}
                        autosize
                    />
                    
                    <TextInput
                        label="Tags"
                        placeholder="Séparés par des virgules"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                    
                    <Select
                        label="Dossier"
                        placeholder="Sélectionner un dossier"
                        data={folders.map(folder => ({ value: folder.name, label: folder.name }))}
                        value={formData.folder}
                        onChange={(value) => setFormData({ ...formData, folder: value || '' })}
                        clearable
                    />
                    
                    <Group justify="flex-end" gap="md">
                        <Button variant="subtle" onClick={() => setModalOpened(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSaveNote} disabled={!formData.title.trim()}>
                            {editingNote ? 'Modifier' : 'Créer'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </MainLayout>
    );
};

export default NotesPageNew;
