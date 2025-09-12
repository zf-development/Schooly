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

const NotesPage: React.FC = () => {
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
        isPinned: false,
        isStarred: false
    });

    // Données d'exemple
    useEffect(() => {
        const sampleNotes: Note[] = [
            {
                id: '1',
                title: 'Notes de cours - Mathématiques',
                content: '# Chapitre 1: Calcul différentiel\n\n## Définition\nLe calcul différentiel est une branche des mathématiques qui étudie les taux de changement.\n\n## Formules importantes\n- Dérivée d\'une fonction: f\'(x) = lim(h→0) [f(x+h) - f(x)]/h\n- Règle de la chaîne: (f∘g)\'(x) = f\'(g(x)) × g\'(x)\n\n## Exemples\n1. f(x) = x² → f\'(x) = 2x\n2. f(x) = sin(x) → f\'(x) = cos(x)',
                tags: ['mathématiques', 'cours', 'calcul'],
                isPinned: true,
                isStarred: true,
                isArchived: false,
                folder: 'Cours',
                createdAt: new Date('2024-11-01'),
                modifiedAt: new Date('2024-11-15'),
                color: '#e3f2fd',
                wordCount: 156
            },
            {
                id: '2',
                title: 'Idées de projet',
                content: '## Projet de fin d\'études\n\n### Sujet proposé\nDéveloppement d\'une application web pour la gestion des notes d\'étudiants.\n\n### Fonctionnalités\n- Authentification sécurisée\n- Interface intuitive\n- Export en PDF\n- Notifications\n\n### Technologies\n- Frontend: React + TypeScript\n- Backend: Node.js + Express\n- Base de données: PostgreSQL\n- Déploiement: Docker',
                tags: ['projet', 'développement', 'web'],
                isPinned: false,
                isStarred: true,
                isArchived: false,
                folder: 'Projets',
                createdAt: new Date('2024-11-05'),
                modifiedAt: new Date('2024-11-12'),
                color: '#f3e5f5',
                wordCount: 89
            },
            {
                id: '3',
                title: 'Liste de tâches',
                content: '## Tâches à faire\n\n### Urgent\n- [ ] Terminer le rapport de stage\n- [ ] Préparer la présentation\n- [ ] Réviser pour l\'examen\n\n### Important\n- [ ] Mettre à jour le CV\n- [ ] Postuler aux offres d\'emploi\n- [ ] Organiser les documents\n\n### Moins urgent\n- [ ] Nettoyer l\'espace de travail\n- [ ] Archiver les anciens fichiers',
                tags: ['tâches', 'organisation', 'urgent'],
                isPinned: false,
                isStarred: false,
                isArchived: false,
                folder: 'Organisation',
                createdAt: new Date('2024-11-08'),
                modifiedAt: new Date('2024-11-16'),
                color: '#fff3e0',
                wordCount: 67
            },
            {
                id: '4',
                title: 'Recettes de cuisine',
                content: '## Pâtes carbonara\n\n### Ingrédients\n- 400g de pâtes\n- 200g de lardons\n- 3 œufs\n- 100g de parmesan\n- Poivre noir\n\n### Préparation\n1. Cuire les pâtes selon les instructions\n2. Faire revenir les lardons\n3. Mélanger les œufs avec le parmesan\n4. Ajouter les pâtes aux lardons\n5. Incorporer le mélange œufs-parmesan\n6. Servir avec du poivre',
                tags: ['cuisine', 'recette', 'pâtes'],
                isPinned: false,
                isStarred: false,
                isArchived: false,
                folder: 'Personnel',
                createdAt: new Date('2024-11-10'),
                modifiedAt: new Date('2024-11-14'),
                color: '#e8f5e8',
                wordCount: 78
            }
        ];

        const sampleFolders: Folder[] = [
            {
                id: 'f1',
                name: 'Cours',
                color: '#e3f2fd',
                noteCount: 1,
                createdAt: new Date('2024-10-01')
            },
            {
                id: 'f2',
                name: 'Projets',
                color: '#f3e5f5',
                noteCount: 1,
                createdAt: new Date('2024-10-05')
            },
            {
                id: 'f3',
                name: 'Organisation',
                color: '#fff3e0',
                noteCount: 1,
                createdAt: new Date('2024-10-08')
            },
            {
                id: 'f4',
                name: 'Personnel',
                color: '#e8f5e8',
                noteCount: 1,
                createdAt: new Date('2024-10-10')
            }
        ];

        setNotes(sampleNotes);
        setFolders(sampleFolders);
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

    const handleCreateNote = () => {
        setEditingNote(null);
        setFormData({
            title: '',
            content: '',
            tags: '',
            folder: '',
            color: '#ffffff',
            isPinned: false,
            isStarred: false
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
            isPinned: note.isPinned,
            isStarred: note.isStarred
        });
        setModalOpened(true);
    };

    const handleSaveNote = () => {
        if (!formData.title.trim()) return;

        const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
        const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

        const newNote: Note = {
            id: editingNote?.id || Date.now().toString(),
            title: formData.title,
            content: formData.content,
            tags,
            isPinned: formData.isPinned,
            isStarred: formData.isStarred,
            isArchived: false,
            folder: formData.folder || undefined,
            createdAt: editingNote?.createdAt || new Date(),
            modifiedAt: new Date(),
            color: formData.color,
            wordCount
        };

        if (editingNote) {
            setNotes(notes.map(n => n.id === editingNote.id ? newNote : n));
        } else {
            setNotes([newNote, ...notes]);
        }

        setModalOpened(false);
        setFormData({
            title: '',
            content: '',
            tags: '',
            folder: '',
            color: '#ffffff',
            isPinned: false,
            isStarred: false
        });
    };

    const handleDeleteNote = (noteId: string) => {
        setNotes(notes.filter(n => n.id !== noteId));
        if (selectedNote?.id === noteId) {
            setSelectedNote(null);
        }
    };

    const handleTogglePin = (noteId: string) => {
        setNotes(notes.map(n => 
            n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
        ));
    };

    const handleToggleStar = (noteId: string) => {
        setNotes(notes.map(n => 
            n.id === noteId ? { ...n, isStarred: !n.isStarred } : n
        ));
    };

    const handleArchiveNote = (noteId: string) => {
        setNotes(notes.map(n => 
            n.id === noteId ? { ...n, isArchived: !n.isArchived } : n
        ));
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFolder = !selectedFolder || note.folder === selectedFolder;
        
        const matchesTab = activeTab === 'all' || 
                          (activeTab === 'pinned' && note.isPinned) ||
                          (activeTab === 'starred' && note.isStarred) ||
                          (activeTab === 'archived' && note.isArchived);

        return matchesSearch && matchesFolder && matchesTab && !note.isArchived;
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

                <Grid>
                    {/* Panneau latéral */}
                    <Grid.Col span={3}>
                        {/* Tags de filtrage */}
                        <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                            <TextInput
                                placeholder="Rechercher dans les notes..."
                                leftSection={<IconSearch size={16} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                mb="lg"
                            />

                            <Text fw={500} mb="md">Filtrer par</Text>
                            <Group gap="xs" justify="center">
                                <Badge
                                    size="md"
                                    variant={activeTab === 'all' ? 'filled' : 'light'}
                                    color="violet"
                                    style={{ cursor: 'pointer', padding: '7px 14px', textTransform: 'lowercase' }}
                                    onClick={() => setActiveTab('all')}
                                >
                                    Toutes
                                </Badge>
                                <Badge
                                    size="md"
                                    variant={activeTab === 'pinned' ? 'filled' : 'light'}
                                    color="blue"
                                    style={{ cursor: 'pointer', padding: '7px 14px', textTransform: 'lowercase' }}
                                    onClick={() => setActiveTab('pinned')}
                                >
                                    Épinglées
                                </Badge>
                                <Badge
                                    size="md"
                                    variant={activeTab === 'starred' ? 'filled' : 'light'}
                                    color="yellow"
                                    style={{ cursor: 'pointer', padding: '7px 14px', textTransform: 'lowercase' }}
                                    onClick={() => setActiveTab('starred')}
                                >
                                    Favorites
                                </Badge>
                                <Badge
                                    size="md"
                                    variant={activeTab === 'archived' ? 'filled' : 'light'}
                                    color="gray"
                                    style={{ cursor: 'pointer', padding: '7px 14px', textTransform: 'lowercase' }}
                                    onClick={() => setActiveTab('archived')}
                                >
                                    Archivées
                                </Badge>
                            </Group>

                            <Divider m="lg" />

                            <Group justify="space-between" mb="md">
                                <Text fw={500}>Dossiers</Text>
                                <ActionIcon size="sm" variant="light">
                                    <IconFolderPlus size={14} />
                                </ActionIcon>
                            </Group>
                            <Stack gap="xs">
                                <Button
                                    variant={selectedFolder === null ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconFolder size={16} />}
                                    onClick={() => setSelectedFolder(null)}
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
                                    >
                                        {folder.name} ({folder.noteCount})
                                    </Button>
                                ))}
                            </Stack>

                            <Divider m="lg" />

                            <Text fw={500} mb="md">Trier par</Text>
                            <Stack gap="xs">
                                <Button
                                    variant={sortBy === 'modified' ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconClock size={16} />}
                                    onClick={() => setSortBy('modified')}
                                >
                                    Date de modification
                                </Button>
                                <Button
                                    variant={sortBy === 'created' ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconCalendar size={16} />}
                                    onClick={() => setSortBy('created')}
                                >
                                    Date de création
                                </Button>
                                <Button
                                    variant={sortBy === 'title' ? 'light' : 'subtle'}
                                    justify="flex-start"
                                    leftSection={<IconSortAscending size={16} />}
                                    onClick={() => setSortBy('title')}
                                >
                                    Titre
                                </Button>
                                <Button
                                    variant="subtle"
                                    justify="flex-start"
                                    leftSection={sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                                </Button>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Liste des notes */}
                    <Grid.Col span={4}>
                        <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                            <Group justify="space-between" mb="md">
                                <Text fw={500}>
                                    {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''}
                                </Text>
                            </Group>
                            
                            <ScrollArea h="calc(100vh - 200px)">
                                <Stack gap="sm">
                                    {sortedNotes.map(note => (
                                        <Paper
                                            key={note.id}
                                            p="md"
                                            radius="md"
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedNote?.id === note.id ? '2px solid var(--mantine-color-violet-3)' : '1px solid var(--mantine-color-gray-3)',
                                                backgroundColor: note.color || '#ffffff'
                                            }}
                                            onClick={() => setSelectedNote(note)}
                                        >
                                            <Group justify="space-between" align="flex-start" mb="sm">
                                                <Text fw={500} size="sm" truncate>
                                                    {note.title}
                                                </Text>
                                                <Group gap="xs">
                                                    {note.isPinned && (
                                                        <IconPinFilled size={14} color="var(--mantine-color-violet-6)" />
                                                    )}
                                                    {note.isStarred && (
                                                        <IconStarFilled size={14} color="var(--mantine-color-yellow-6)" />
                                                    )}
                                                    <Menu>
                                                        <Menu.Target>
                                                            <ActionIcon size="sm" variant="subtle">
                                                                <IconDots size={12} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item 
                                                                leftSection={<IconEdit size={14} />}
                                                                onClick={() => handleEditNote(note)}
                                                            >
                                                                Modifier
                                                            </Menu.Item>
                                                            <Menu.Item 
                                                                leftSection={note.isPinned ? <IconPin size={14} /> : <IconPinFilled size={14} />}
                                                                onClick={() => handleTogglePin(note.id)}
                                                            >
                                                                {note.isPinned ? 'Désépingler' : 'Épingler'}
                                                            </Menu.Item>
                                                            <Menu.Item 
                                                                leftSection={note.isStarred ? <IconStar size={14} /> : <IconStarFilled size={14} />}
                                                                onClick={() => handleToggleStar(note.id)}
                                                            >
                                                                {note.isStarred ? 'Retirer des favorites' : 'Ajouter aux favorites'}
                                                            </Menu.Item>
                                                            <Menu.Item 
                                                                leftSection={<IconArchive size={14} />}
                                                                onClick={() => handleArchiveNote(note.id)}
                                                            >
                                                                Archiver
                                                            </Menu.Item>
                                                            <Menu.Divider />
                                                            <Menu.Item 
                                                                leftSection={<IconTrash size={14} />}
                                                                color="red"
                                                                onClick={() => handleDeleteNote(note.id)}
                                                            >
                                                                Supprimer
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Group>
                                            </Group>
                                            
                                            <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
                                                {note.content.replace(/[#*`]/g, '').substring(0, 100)}...
                                            </Text>
                                            
                                            <Group justify="space-between" align="center">
                                                <Group gap="xs">
                                                    {note.tags.slice(0, 2).map(tag => (
                                                        <Badge key={tag} size="xs" variant="light">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {note.tags.length > 2 && (
                                                        <Text size="xs" c="dimmed">
                                                            +{note.tags.length - 2}
                                                        </Text>
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
                        </Card>
                    </Grid.Col>

                    {/* Aperçu de la note */}
                    <Grid.Col span={5}>
                        <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                            {selectedNote ? (
                                <Stack h="100%">
                                    <Group justify="space-between" align="flex-start">
                                        <Title order={3} size="h4">
                                            {selectedNote.title}
                                        </Title>
                                        <Group gap="xs">
                                            <ActionIcon
                                                variant={selectedNote.isPinned ? 'filled' : 'light'}
                                                color="violet"
                                                onClick={() => handleTogglePin(selectedNote.id)}
                                            >
                                                {selectedNote.isPinned ? <IconPinFilled size={16} /> : <IconPin size={16} />}
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={selectedNote.isStarred ? 'filled' : 'light'}
                                                color="yellow"
                                                onClick={() => handleToggleStar(selectedNote.id)}
                                            >
                                                {selectedNote.isStarred ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="light"
                                                onClick={() => handleEditNote(selectedNote)}
                                            >
                                                <IconEdit size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>

                                    <Group gap="xs" mb="md">
                                        {selectedNote.tags.map(tag => (
                                            <Badge key={tag} size="sm" variant="light">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </Group>

                                    <Divider />

                                    <ScrollArea h="calc(100vh - 300px)">
                                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedNote.content}
                                        </Text>
                                    </ScrollArea>

                                    <Divider />

                                    <Group justify="space-between" align="center">
                                        <Text size="xs" c="dimmed">
                                            {selectedNote.wordCount} mots • 
                                            Créé le {formatDate(selectedNote.createdAt)} • 
                                            Modifié le {formatDate(selectedNote.modifiedAt)} à {formatTime(selectedNote.modifiedAt)}
                                        </Text>
                                        <Group gap="xs">
                                            <ActionIcon size="sm" variant="light">
                                                <IconShare size={14} />
                                            </ActionIcon>
                                            <ActionIcon size="sm" variant="light">
                                                <IconCopy size={14} />
                                            </ActionIcon>
                                            <ActionIcon size="sm" variant="light">
                                                <IconDownload size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Stack>
                            ) : (
                                <Center h="100%">
                                    <Stack align="center" gap="md">
                                        <ThemeIcon size={64} radius="md" color="gray" variant="light">
                                            <IconNotes size={32} />
                                        </ThemeIcon>
                                        <Text size="lg" c="dimmed">
                                            Sélectionnez une note
                                        </Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            Choisissez une note dans la liste pour la consulter
                                        </Text>
                                    </Stack>
                                </Center>
                            )}
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Modal de création/édition de note */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={editingNote ? "Modifier la note" : "Nouvelle note"}
                    size="lg"
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
                            placeholder="Contenu de la note (Markdown supporté)"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={10}
                            autosize
                            minRows={10}
                        />

                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Tags"
                                    placeholder="tag1, tag2, tag3"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Dossier"
                                    placeholder="Sélectionner un dossier"
                                    value={formData.folder}
                                    onChange={(value) => setFormData({ ...formData, folder: value || '' })}
                                    data={[
                                        { value: '', label: 'Aucun dossier' },
                                        ...folders.map(folder => ({
                                            value: folder.name,
                                            label: folder.name
                                        }))
                                    ]}
                                    clearable
                                />
                            </Grid.Col>
                        </Grid>

                        <Group justify="space-between">
                            <Group>
                                <Button
                                    variant={formData.isPinned ? 'filled' : 'light'}
                                    color="violet"
                                    leftSection={<IconPin size={16} />}
                                    onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                                >
                                    {formData.isPinned ? 'Épinglée' : 'Épingler'}
                                </Button>
                                <Button
                                    variant={formData.isStarred ? 'filled' : 'light'}
                                    color="yellow"
                                    leftSection={<IconStar size={16} />}
                                    onClick={() => setFormData({ ...formData, isStarred: !formData.isStarred })}
                                >
                                    {formData.isStarred ? 'Favorite' : 'Ajouter aux favorites'}
                                </Button>
                            </Group>
                            <Group>
                                <Button variant="light" onClick={() => setModalOpened(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleSaveNote} color="violet">
                                    {editingNote ? 'Modifier' : 'Créer'}
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </Modal>
        </MainLayout>
    );
};

export default NotesPage;
