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
    IconFolderPlus,
    IconCheck,
    IconX
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
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
    const [activeTab, setActiveTab] = useState<string>('all');
    const [editingContent, setEditingContent] = useState('');
    const [editingTags, setEditingTags] = useState('');
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [currentTagInput, setCurrentTagInput] = useState('');

    // État du formulaire pour la création de notes
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
                content: '# Équations du second degré\n\nLes équations du second degré sont de la forme **ax² + bx + c = 0**.\n\n## Discriminant\nLe discriminant Δ = b² - 4ac détermine la nature des solutions :\n\n- Si Δ > 0 : deux solutions réelles distinctes\n- Si Δ = 0 : une solution double\n- Si Δ < 0 : aucune solution réelle\n\n## Exemple\n```\nRésoudre : x² - 5x + 6 = 0\nΔ = 25 - 24 = 1 > 0\nx₁ = (5 + 1)/2 = 3\nx₂ = (5 - 1)/2 = 2\n```',
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
                content: '# Projet Final - Application Web\n\n## Objectif\nCréer une application web moderne avec **React** et **TypeScript**.\n\n## Fonctionnalités principales\n- [x] Authentification sécurisée\n- [ ] Interface intuitive\n- [ ] Export en PDF\n- [ ] Notifications temps réel\n\n## Technologies\n- **Frontend**: React + TypeScript\n- **Backend**: Node.js + Express\n- **Base de données**: PostgreSQL\n- **Déploiement**: Docker\n\n> **Note**: Commencer par le MVP avec les fonctionnalités essentielles.',
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
                content: '# Tâches de la semaine\n\n## Urgent\n- [ ] Finir le rapport de stage\n- [ ] Préparer la présentation\n- [ ] Réviser pour l\'examen de physique\n\n## Important\n- [ ] Appeler le professeur\n- [ ] Mettre à jour le CV\n- [ ] Postuler aux offres d\'emploi\n\n## Moins urgent\n- [ ] Nettoyer l\'espace de travail\n- [ ] Archiver les anciens fichiers',
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
                content: '# Cookies aux pépites de chocolat\n\n## Ingrédients\n- 200g de farine\n- 100g de beurre\n- 80g de sucre\n- 1 œuf\n- 100g de pépites de chocolat\n\n## Instructions\n1. **Préchauffer** le four à 180°C\n2. **Mélanger** le beurre et le sucre\n3. **Ajouter** l\'œuf et mélanger\n4. **Incorporer** la farine progressivement\n5. **Ajouter** les pépites de chocolat\n6. **Former** des boules et les déposer sur la plaque\n7. **Cuire** 12-15 minutes\n\n> **Astuce**: Ne pas trop cuire pour garder les cookies moelleux !',
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
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Nouvelle note',
            content: '# Nouvelle note\n\nCommencez à écrire...',
            tags: [],
            isPinned: false,
            isStarred: false,
            isArchived: false,
            folder: selectedFolder || undefined,
            createdAt: new Date(),
            modifiedAt: new Date(),
            color: '#ffffff',
            wordCount: 0
        };
        
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setEditingContent(newNote.content);
        setEditingTags(newNote.tags.join(', '));
    };

    const handleEditNote = (note: Note) => {
        setSelectedNote(note);
        setEditingContent(note.content);
        setEditingTags(note.tags.join(', '));
        setCurrentTagInput('');
    };

    const handleSaveNote = () => {
        if (!selectedNote) return;
        
        const updatedNote = {
            ...selectedNote,
            content: editingContent,
            tags: editingTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            modifiedAt: new Date(),
            wordCount: editingContent.split(' ').length
        };
        
        setNotes(notes.map(note => note.id === selectedNote.id ? updatedNote : note));
        setSelectedNote(updatedNote);
    };

    const handleSaveTags = () => {
        if (!selectedNote) return;
        
        const updatedNote = {
            ...selectedNote,
            tags: editingTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            modifiedAt: new Date()
        };
        
        setNotes(notes.map(note => note.id === selectedNote.id ? updatedNote : note));
        setSelectedNote(updatedNote);
        setIsEditingTags(false);
    };

    const handleCancelEditTags = () => {
        setEditingTags(selectedNote?.tags.join(', ') || '');
        setCurrentTagInput('');
        setIsEditingTags(false);
    };

    const handleAddTag = (tag: string) => {
        if (tag.trim() && !editingTags.split(',').map(t => t.trim()).includes(tag.trim())) {
            const newTags = editingTags ? `${editingTags}, ${tag.trim()}` : tag.trim();
            setEditingTags(newTags);
        }
        setCurrentTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const tags = editingTags.split(',').map(tag => tag.trim()).filter(tag => tag !== tagToRemove);
        setEditingTags(tags.join(', '));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === ' ' || e.key === 'Tab' || e.key === 'Enter') && currentTagInput.trim()) {
            e.preventDefault();
            handleAddTag(currentTagInput);
        } else if (e.key === 'Backspace' && !currentTagInput && editingTags) {
            // Si on appuie sur Backspace et qu'il n'y a pas de texte dans l'input, supprimer le dernier tag
            const tags = editingTags.split(',').map(tag => tag.trim());
            if (tags.length > 0) {
                tags.pop();
                setEditingTags(tags.join(', '));
            }
        }
    };

    const handleTagInputBlur = () => {
        // Sauvegarder automatiquement quand on perd le focus
        if (currentTagInput.trim()) {
            handleAddTag(currentTagInput);
        }
        handleSaveTags();
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
        console.log('Exporter la note:', id);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
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
            {/* En-tête */}
            <Group justify="space-between" align="center" mb="xl">
                <Group>
                    <ThemeIcon size={40} radius="md" color="violet">
                        <IconNotes size={24} />
                    </ThemeIcon>
                    <div>
                        <Title order={1} size="h2">
                            Mes Notes
                        </Title>
                        <Text c="dimmed" size="sm">
                            Organisez vos idées et vos pensées
                        </Text>
                    </div>
                </Group>
            </Group>

            {/* Interface 12 colonnes */}
            <Grid gutter="lg" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Colonnes 1-3: Filtres consolidés */}
                <Grid.Col span={3}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                        <Stack gap="lg" h="100%">
                            {/* Barre de recherche */}
                            <div>
                                <Text fw={600} size="lg" mb="md" c="dark">Recherche</Text>
                                <TextInput
                                    placeholder="Rechercher dans vos notes..."
                                    leftSection={<IconSearch size={18} />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="md"
                                    radius="md"
                                />
                            </div>

                            {/* Filtres */}
                            <div>
                                <Text fw={600} size="lg" mb="md" c="dark">Filtres</Text>
                                <Stack gap="xs">
                                    <Button
                                        variant={activeTab === 'all' ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconNotes size={16} />}
                                        onClick={() => setActiveTab('all')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        Toutes les notes
                                    </Button>
                                    <Button
                                        variant={activeTab === 'starred' ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconStarFilled size={16} />}
                                        onClick={() => setActiveTab('starred')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        Favorites
                                    </Button>
                                    <Button
                                        variant={activeTab === 'pinned' ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconPinFilled size={16} />}
                                        onClick={() => setActiveTab('pinned')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        Épinglées
                                    </Button>
                                    <Button
                                        variant={activeTab === 'archived' ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconArchive size={16} />}
                                        onClick={() => setActiveTab('archived')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        Archivées
                                    </Button>
                                </Stack>
                            </div>

                            <Divider />

                            {/* Dossiers */}
                            <div>
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
                                        radius="md"
                                        fullWidth
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
                                            radius="md"
                                            fullWidth
                                        >
                                            {folder.name} ({folder.noteCount})
                                        </Button>
                                    ))}
                                </Stack>
                            </div>

                            <Divider />

                            {/* Options de tri */}
                            <div>
                                <Text fw={600} size="lg" mb="md" c="dark">Trier par</Text>
                                <Stack gap="xs">
                                    <Button
                                        variant={sortBy === 'modified' ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconClock size={16} />}
                                        onClick={() => setSortBy('modified')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        Date de modification
                                    </Button>
                                    <Button
                                        variant={sortBy === 'created' ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconCalendar size={16} />}
                                        onClick={() => setSortBy('created')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        Date de création
                                    </Button>
                                    <Button
                                        variant={sortBy === 'title' ? 'light' : 'subtle'}
                                        justify="flex-start"
                                        leftSection={<IconSortAscending size={16} />}
                                        onClick={() => setSortBy('title')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        Titre
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        justify="flex-start"
                                        leftSection={sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        size="md"
                                        radius="md"
                                        fullWidth
                                    >
                                        {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                                    </Button>
                                </Stack>
                            </div>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* Colonnes 4-6: Liste des notes */}
                <Grid.Col span={3}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                        <Group justify="space-between" mb="lg">
                            <Text fw={600} size="lg" c="dark">
                                {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''}
                            </Text>
                            <ActionIcon
                                variant="light"
                                color="violet"
                                size="lg"
                                radius="md"
                                onClick={handleCreateNote}
                            >
                                <IconPlus size={18} />
                            </ActionIcon>
                        </Group>
                        
                        <ScrollArea h="calc(100% - 60px)">
                            <Stack gap="md">
                                {sortedNotes.map(note => (
                                    <Paper
                                        key={note.id}
                                        p="md"
                                        radius="md"
                                        style={{
                                            cursor: 'pointer',
                                            border: selectedNote?.id === note.id ? '2px solid #667eea' : '1px solid #e9ecef',
                                            backgroundColor: note.color || '#ffffff',
                                            transition: 'all 0.2s ease',
                                            boxShadow: selectedNote?.id === note.id ? '0 8px 25px rgba(102, 126, 234, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'
                                        }}
                                        onClick={() => {
                                            setSelectedNote(note);
                                            setEditingContent(note.content);
                                            setEditingTags(note.tags.join(', '));
                                            setCurrentTagInput('');
                                        }}
                                    >
                                        <Group justify="space-between" align="flex-start" mb="sm">
                                            <Text fw={600} size="sm" truncate style={{ flex: 1 }}>
                                                {note.title}
                                            </Text>
                                            <Group gap="xs">
                                                {note.isPinned && (
                                                    <IconPinFilled size={14} color="#667eea" />
                                                )}
                                                {note.isStarred && (
                                                    <IconStarFilled size={14} color="#f39c12" />
                                                )}
                                            </Group>
                                        </Group>
                                        <Text size="xs" c="dimmed" lineClamp={2} mb="sm" style={{ lineHeight: 1.4 }}>
                                            {note.content.replace(/[#*`]/g, '').substring(0, 80)}...
                                        </Text>
                                        <Group justify="space-between" align="center">
                                            <Group gap="xs">
                                                {note.tags.slice(0, 2).map(tag => (
                                                    <Badge key={tag} size="xs" variant="light" color="violet" radius="md">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {note.tags.length > 2 && (
                                                    <Badge size="xs" variant="light" color="gray" radius="md">
                                                        +{note.tags.length - 2}
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
                    </Card>
                </Grid.Col>

                {/* Colonnes 7-12: Éditeur de notes */}
                <Grid.Col span={6}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                        {selectedNote ? (
                            <Stack gap="lg" h="100%">
                                {/* En-tête de la note */}
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
                                        <Group gap="xs" mb="lg" align="center">
                                            {isEditingTags ? (
                                                <Box style={{ flex: 1 }}>
                                                    <Paper
                                                        p="xs"
                                                        radius="md"
                                                        withBorder
                                                        style={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: '4px',
                                                            alignItems: 'center',
                                                            minHeight: '32px',
                                                            cursor: 'text'
                                                        }}
                                                        onClick={() => {
                                                            // Focus sur l'input quand on clique sur le container
                                                            const input = document.getElementById('tag-input');
                                                            if (input) input.focus();
                                                        }}
                                                    >
                                                        {editingTags.split(',').map(tag => tag.trim()).filter(tag => tag).map(tag => (
                                                            <Badge
                                                                key={tag}
                                                                size="xs"
                                                                variant="light"
                                                                color="violet"
                                                                radius="md"
                                                                rightSection={
                                                                    <ActionIcon
                                                                        size="xs"
                                                                        variant="transparent"
                                                                        color="violet"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveTag(tag);
                                                                        }}
                                                                    >
                                                                        <IconX size={8} />
                                                                    </ActionIcon>
                                                                }
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        <TextInput
                                                            id="tag-input"
                                                            value={currentTagInput}
                                                            onChange={(e) => setCurrentTagInput(e.target.value)}
                                                            onKeyDown={handleTagInputKeyDown}
                                                            onBlur={handleTagInputBlur}
                                                            placeholder="Ajouter un tag..."
                                                            size="xs"
                                                            variant="unstyled"
                                                            style={{
                                                                flex: 1,
                                                                minWidth: '120px',
                                                                border: 'none',
                                                                outline: 'none',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                    </Paper>
                                                    <Group gap="xs" mt="xs">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="green"
                                                            size="sm"
                                                            onClick={handleSaveTags}
                                                        >
                                                            <IconCheck size={14} />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            size="sm"
                                                            onClick={handleCancelEditTags}
                                                        >
                                                            <IconX size={14} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Box>
                                            ) : (
                                                <>
                                                    {selectedNote.tags.map(tag => (
                                                        <Badge key={tag} size="md" variant="light" color="violet" radius="md">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    <ActionIcon
                                                        variant="light"
                                                        color="violet"
                                                        size="sm"
                                                        onClick={() => setIsEditingTags(true)}
                                                    >
                                                        <IconEdit size={14} />
                                                    </ActionIcon>
                                                </>
                                            )}
                                        </Group>
                                    </div>
                                    <Group gap="xs">
                                        <ActionIcon
                                            variant="light"
                                            color="violet"
                                            size="lg"
                                            radius="md"
                                            onClick={() => handleToggleStar(selectedNote.id)}
                                        >
                                            {selectedNote.isStarred ? <IconStar size={18} /> : <IconStarFilled size={18} />}
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="light"
                                            color="violet"
                                            size="lg"
                                            radius="md"
                                            onClick={() => handleTogglePin(selectedNote.id)}
                                        >
                                            {selectedNote.isPinned ? <IconPin size={18} /> : <IconPinFilled size={18} />}
                                        </ActionIcon>
                                        <Menu>
                                            <Menu.Target>
                                                <ActionIcon variant="light" color="violet" size="lg" radius="md">
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
                                
                                {/* Contenu de la note */}
                                <Box style={{ flex: 1, minHeight: 0 }}>
                                    <Textarea
                                        value={editingContent}
                                        onChange={(e) => {
                                            setEditingContent(e.target.value);
                                            handleSaveNote();
                                        }}
                                        placeholder="Contenu de la note (Markdown supporté)"
                                        minRows={20}
                                        autosize
                                        styles={{
                                            input: {
                                                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                                fontSize: '14px',
                                                lineHeight: 1.6,
                                                border: 'none',
                                                boxShadow: 'none',
                                                '&:focus': {
                                                    border: '2px solid #667eea',
                                                    boxShadow: '0 0 0 1px #667eea'
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                                
                                <Divider />
                                
                                {/* Métadonnées */}
                                <Group justify="space-between" align="center">
                                    <Text size="sm" c="dimmed">
                                        Créé le {formatDate(selectedNote.createdAt)} • Modifié le {formatDate(selectedNote.modifiedAt)}
                                    </Text>
                                    <Badge size="sm" variant="light" color="gray" radius="md">
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
                    </Card>
                </Grid.Col>
            </Grid>
        </MainLayout>
    );
};

export default NotesPage;