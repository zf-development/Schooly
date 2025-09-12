import React, { useState } from 'react';
import {
    Container,
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
    Checkbox,
    ActionIcon,
    Paper,
    ScrollArea,
    Avatar,
    Flex,
    Box,
    Menu,
    Tooltip,
    Grid,
    UnstyledButton,
    List,
    Collapse
} from '@mantine/core';
import {
    IconMail,
    IconPlus,
    IconEdit,
    IconTrash,
    IconEye,
    IconEyeOff,
    IconStar,
    IconStarFilled,
    IconArchive,
    IconSend,
    IconArrowBack,
    IconArrowBackUp,
    IconArrowForward,
    IconFlag,
    IconFlagFilled,
    IconSearch,
    IconFilter,
    IconRefresh,
    IconDownload,
    IconPaperclip,
    IconClock,
    IconUser,
    IconMailOpened,
    IconMailForward,
    IconDots,
    IconCheck,
    IconX,
    IconChevronDown,
    IconChevronRight,
    IconFolder,
    IconFolderOpen,
    IconSettings,
    IconSortAscending,
    IconSortDescending
} from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';

// Types
interface Email {
    id: string;
    subject: string;
    sender: {
        name: string;
        email: string;
        avatar?: string;
    };
    recipients: {
        to: string[];
        cc?: string[];
        bcc?: string[];
    };
    content: string;
    isRead: boolean;
    isStarred: boolean;
    isFlagged: boolean;
    isArchived: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive';
    labels: string[];
    attachments: {
        name: string;
        size: number;
        type: string;
    }[];
    receivedAt: string;
    sentAt?: string;
    replyTo?: string;
    threadId?: string;
    isDraft: boolean;
}

interface EmailThread {
    id: string;
    subject: string;
    emails: Email[];
    participants: string[];
    lastActivity: string;
    isUnread: boolean;
}

// Données placeholder
const mockEmails: Email[] = [
    {
        id: '1',
        subject: 'Devoir de Mathématiques - Échéance demain',
        sender: {
            name: 'Prof. Dubois',
            email: 'prof.dubois@universite.fr',
            avatar: ''
        },
        recipients: {
            to: ['etudiant@universite.fr']
        },
        content: 'Bonjour,<br><br>Je vous rappelle que le devoir de mathématiques est à rendre demain avant 23h59. N\'oubliez pas de bien justifier vos réponses.<br><br>Cordialement,<br>Prof. Dubois',
        isRead: false,
        isStarred: true,
        isFlagged: true,
        isArchived: false,
        priority: 'high',
        folder: 'inbox',
        labels: ['devoirs', 'mathématiques', 'urgent'],
        attachments: [
            { name: 'devoir_maths.pdf', size: 245760, type: 'application/pdf' }
        ],
        receivedAt: '2024-12-01T14:30:00Z',
        isDraft: false
    },
    {
        id: '2',
        subject: 'Réunion projet groupe - Mardi 15h',
        sender: {
            name: 'Marie Martin',
            email: 'marie.martin@universite.fr',
            avatar: ''
        },
        recipients: {
            to: ['etudiant@universite.fr', 'pierre.dupont@universite.fr'],
            cc: ['superviseur@universite.fr']
        },
        content: 'Salut tout le monde,<br><br>Je propose qu\'on se retrouve mardi à 15h en salle B203 pour finaliser notre présentation. Pensez à apporter vos notes.<br><br>À bientôt !',
        isRead: true,
        isStarred: false,
        isFlagged: false,
        isArchived: false,
        priority: 'normal',
        folder: 'inbox',
        labels: ['projet', 'réunion'],
        attachments: [],
        receivedAt: '2024-11-30T16:45:00Z',
        isDraft: false
    },
    {
        id: '3',
        subject: 'Résultats examen Physique',
        sender: {
            name: 'Prof. Leroy',
            email: 'prof.leroy@universite.fr',
            avatar: ''
        },
        recipients: {
            to: ['etudiant@universite.fr']
        },
        content: 'Bonjour,<br><br>Les résultats de l\'examen de physique sont maintenant disponibles sur la plateforme. Félicitations pour votre excellent travail !<br><br>Prof. Leroy',
        isRead: true,
        isStarred: false,
        isFlagged: false,
        isArchived: false,
        priority: 'normal',
        folder: 'inbox',
        labels: ['résultats', 'physique'],
        attachments: [
            { name: 'resultats_physique.xlsx', size: 128000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        ],
        receivedAt: '2024-11-29T10:15:00Z',
        isDraft: false
    },
    {
        id: '4',
        subject: 'Invitation événement étudiant',
        sender: {
            name: 'Bureau des étudiants',
            email: 'bde@universite.fr',
            avatar: ''
        },
        recipients: {
            to: ['etudiant@universite.fr']
        },
        content: 'Cher(e) étudiant(e),<br><br>Nous vous invitons à notre soirée de fin de semestre le 15 décembre. Inscription obligatoire avant le 10 décembre.<br><br>L\'équipe BDE',
        isRead: false,
        isStarred: false,
        isFlagged: false,
        isArchived: false,
        priority: 'low',
        folder: 'inbox',
        labels: ['événement', 'bde'],
        attachments: [
            { name: 'invitation_soiree.pdf', size: 512000, type: 'application/pdf' }
        ],
        receivedAt: '2024-11-28T09:00:00Z',
        isDraft: false
    },
    {
        id: '5',
        subject: 'Brouillon - Questions cours chimie',
        sender: {
            name: 'Moi',
            email: 'etudiant@universite.fr',
            avatar: ''
        },
        recipients: {
            to: ['prof.moreau@universite.fr']
        },
        content: 'Bonjour Professeur,<br><br>J\'aurais quelques questions concernant le cours de chimie de mardi dernier. Pourriez-vous m\'expliquer...',
        isRead: true,
        isStarred: false,
        isFlagged: false,
        isArchived: false,
        priority: 'normal',
        folder: 'drafts',
        labels: ['questions', 'chimie'],
        attachments: [],
        receivedAt: '2024-11-27T20:30:00Z',
        sentAt: '2024-11-27T20:30:00Z',
        isDraft: true
    }
];

const mockThreads: EmailThread[] = [
    {
        id: '1',
        subject: 'Discussion projet final',
        emails: mockEmails.slice(0, 2),
        participants: ['etudiant@universite.fr', 'marie.martin@universite.fr'],
        lastActivity: '2024-12-01T14:30:00Z',
        isUnread: true
    }
];

const EmailsPage: React.FC = () => {
    const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
    const [isReadModalOpen, setIsReadModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<string[]>(['inbox']);
    const [sortBy, setSortBy] = useState<'date' | 'sender' | 'subject'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filtrage des emails par dossier
    const getFilteredEmails = () => {
        let filtered = mockEmails.filter(email => email.folder === selectedFolder);
        
        if (searchQuery) {
            filtered = filtered.filter(email => 
                email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                email.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return filtered.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    };

    const filteredEmails = getFilteredEmails();

    // Statistiques
    const stats = {
        total: mockEmails.length,
        unread: mockEmails.filter(e => !e.isRead).length,
        starred: mockEmails.filter(e => e.isStarred).length,
        drafts: mockEmails.filter(e => e.isDraft).length
    };

    // Gestion des couleurs de priorité
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'red';
            case 'high': return 'orange';
            case 'normal': return 'blue';
            case 'low': return 'gray';
            default: return 'gray';
        }
    };

    // Gestion des labels de priorité
    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'Urgent';
            case 'high': return 'Élevée';
            case 'normal': return 'Normale';
            case 'low': return 'Faible';
            default: return priority;
        }
    };

    // Gestion des couleurs de dossier
    const getFolderColor = (folder: string) => {
        switch (folder) {
            case 'inbox': return 'blue';
            case 'sent': return 'green';
            case 'drafts': return 'yellow';
            case 'trash': return 'red';
            case 'spam': return 'orange';
            case 'archive': return 'gray';
            default: return 'gray';
        }
    };

    // Gestion des labels de dossier
    const getFolderLabel = (folder: string) => {
        switch (folder) {
            case 'inbox': return 'Boîte de réception';
            case 'sent': return 'Envoyés';
            case 'drafts': return 'Brouillons';
            case 'trash': return 'Corbeille';
            case 'spam': return 'Spam';
            case 'archive': return 'Archives';
            default: return folder;
        }
    };

    const handleEmailClick = (email: Email) => {
        setSelectedEmail(email);
        // Marquer comme lu
        if (!email.isRead) {
            // Ici, vous pourriez mettre à jour l'état
        }
    };

    const handleCompose = () => {
        setIsComposeModalOpen(true);
    };

    const handleStar = (emailId: string) => {
        // Ici, vous pourriez basculer l'état starred
        console.log('Toggle star for email:', emailId);
    };

    const handleFlag = (emailId: string) => {
        // Ici, vous pourriez basculer l'état flagged
        console.log('Toggle flag for email:', emailId);
    };

    const handleArchive = (emailId: string) => {
        // Ici, vous pourriez archiver l'email
        console.log('Archive email:', emailId);
    };

    const handleDelete = (emailId: string) => {
        // Ici, vous pourriez supprimer l'email
        console.log('Delete email:', emailId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 jours
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="md" px="md">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconMail size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Courriels
                            </Title>
                            <Text c="dimmed" size="sm">
                                Gestion des emails et communications
                            </Text>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={handleCompose}
                            variant="light"
                        >
                            Nouveau message
                        </Button>
                    </Group>
                </Group>

                {/* Interface style Outlook - 3 colonnes */}
                <Grid gutter={0} style={{ height: 'calc(100vh - 200px)' }}>
                    {/* Colonne 1: Dossiers */}
                    <Grid.Col span={3} style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
                        <Paper p="md" style={{ height: '100%' }}>
                            <Stack gap="xs">
                                <Text fw={600} size="sm" mb="xs">Dossiers</Text>
                                
                                {/* Dossiers principaux */}
                                <UnstyledButton
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedFolder === 'inbox' ? 'var(--mantine-color-blue-0)' : 'transparent',
                                        fontWeight: selectedFolder === 'inbox' ? 600 : 400
                                    }}
                                    onClick={() => setSelectedFolder('inbox')}
                                >
                                    <Group gap="sm" justify="space-between">
                                        <Group gap="sm">
                                            <IconMail size={16} />
                                            <Text size="sm">Boîte de réception</Text>
                                        </Group>
                                        <Badge size="xs" variant="light">
                                            {mockEmails.filter(e => e.folder === 'inbox').length}
                                        </Badge>
                                    </Group>
                                </UnstyledButton>

                                <UnstyledButton
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedFolder === 'sent' ? 'var(--mantine-color-blue-0)' : 'transparent',
                                        fontWeight: selectedFolder === 'sent' ? 600 : 400
                                    }}
                                    onClick={() => setSelectedFolder('sent')}
                                >
                                    <Group gap="sm" justify="space-between">
                                        <Group gap="sm">
                                            <IconSend size={16} />
                                            <Text size="sm">Envoyés</Text>
                                        </Group>
                                        <Badge size="xs" variant="light">
                                            {mockEmails.filter(e => e.folder === 'sent').length}
                                        </Badge>
                                    </Group>
                                </UnstyledButton>

                                <UnstyledButton
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedFolder === 'drafts' ? 'var(--mantine-color-blue-0)' : 'transparent',
                                        fontWeight: selectedFolder === 'drafts' ? 600 : 400
                                    }}
                                    onClick={() => setSelectedFolder('drafts')}
                                >
                                    <Group gap="sm" justify="space-between">
                                        <Group gap="sm">
                                            <IconEdit size={16} />
                                            <Text size="sm">Brouillons</Text>
                                        </Group>
                                        <Badge size="xs" variant="light">
                                            {stats.drafts}
                                        </Badge>
                                    </Group>
                                </UnstyledButton>

                                <UnstyledButton
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedFolder === 'archive' ? 'var(--mantine-color-blue-0)' : 'transparent',
                                        fontWeight: selectedFolder === 'archive' ? 600 : 400
                                    }}
                                    onClick={() => setSelectedFolder('archive')}
                                >
                                    <Group gap="sm" justify="space-between">
                                        <Group gap="sm">
                                            <IconArchive size={16} />
                                            <Text size="sm">Archives</Text>
                                        </Group>
                                        <Badge size="xs" variant="light">
                                            {mockEmails.filter(e => e.folder === 'archive').length}
                                        </Badge>
                                    </Group>
                                </UnstyledButton>

                                <UnstyledButton
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedFolder === 'trash' ? 'var(--mantine-color-blue-0)' : 'transparent',
                                        fontWeight: selectedFolder === 'trash' ? 600 : 400
                                    }}
                                    onClick={() => setSelectedFolder('trash')}
                                >
                                    <Group gap="sm" justify="space-between">
                                        <Group gap="sm">
                                            <IconTrash size={16} />
                                            <Text size="sm">Corbeille</Text>
                                        </Group>
                                        <Badge size="xs" variant="light">
                                            {mockEmails.filter(e => e.folder === 'trash').length}
                                        </Badge>
                                    </Group>
                                </UnstyledButton>

                                <Divider my="sm" />

                                {/* Dossiers personnalisés */}
                                <Text fw={600} size="sm" mb="xs">Dossiers personnalisés</Text>
                                
                                <UnstyledButton
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedFolder === 'starred' ? 'var(--mantine-color-blue-0)' : 'transparent',
                                        fontWeight: selectedFolder === 'starred' ? 600 : 400
                                    }}
                                    onClick={() => setSelectedFolder('starred')}
                                >
                                    <Group gap="sm" justify="space-between">
                                        <Group gap="sm">
                                            <IconStar size={16} />
                                            <Text size="sm">Favoris</Text>
                                        </Group>
                                        <Badge size="xs" variant="light">
                                            {stats.starred}
                                        </Badge>
                                    </Group>
                                </UnstyledButton>

                                <UnstyledButton
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedFolder === 'flagged' ? 'var(--mantine-color-blue-0)' : 'transparent',
                                        fontWeight: selectedFolder === 'flagged' ? 600 : 400
                                    }}
                                    onClick={() => setSelectedFolder('flagged')}
                                >
                                    <Group gap="sm" justify="space-between">
                                        <Group gap="sm">
                                            <IconFlag size={16} />
                                            <Text size="sm">Drapeaux</Text>
                                        </Group>
                                        <Badge size="xs" variant="light">
                                            {mockEmails.filter(e => e.isFlagged).length}
                                        </Badge>
                                    </Group>
                                </UnstyledButton>
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    {/* Colonne 2: Liste des emails */}
                    <Grid.Col span={4} style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
                        <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Barre d'outils */}
                            <Group justify="space-between" mb="md">
                                <Group>
                                    <Checkbox
                                        checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                                        indeterminate={selectedEmails.length > 0 && selectedEmails.length < filteredEmails.length}
                                        onChange={(e) => {
                                            if (e.currentTarget.checked) {
                                                setSelectedEmails(filteredEmails.map(e => e.id));
                                            } else {
                                                setSelectedEmails([]);
                                            }
                                        }}
                                    />
                                    <ActionIcon variant="subtle">
                                        <IconRefresh size={16} />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle">
                                        <IconArchive size={16} />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle">
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Group>
                                <Group>
                                    <Select
                                        size="xs"
                                        value={sortBy}
                                        onChange={(value) => setSortBy(value as 'date' | 'sender' | 'subject')}
                                        data={[
                                            { value: 'date', label: 'Date' },
                                            { value: 'sender', label: 'Expéditeur' },
                                            { value: 'subject', label: 'Objet' }
                                        ]}
                                    />
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                                    </ActionIcon>
                                </Group>
                            </Group>

                            {/* Barre de recherche */}
                            <TextInput
                                placeholder="Rechercher dans les emails..."
                                leftSection={<IconSearch size={16} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                mb="md"
                                size="sm"
                            />

                            {/* Liste des emails */}
                            <ScrollArea style={{ flex: 1 }}>
                                <Stack gap={0}>
                                    {filteredEmails.map((email) => (
                                        <Paper
                                            key={email.id}
                                            p="sm"
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: email.isRead ? 'transparent' : 'var(--mantine-color-blue-0)',
                                                borderLeft: email.isFlagged ? '3px solid var(--mantine-color-red-6)' : '3px solid transparent',
                                                borderBottom: '1px solid var(--mantine-color-gray-2)',
                                                fontWeight: email.isRead ? 400 : 600
                                            }}
                                            onClick={() => handleEmailClick(email)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = email.isRead ? 'transparent' : 'var(--mantine-color-blue-0)';
                                            }}
                                        >
                                            <Group justify="space-between" align="flex-start">
                                                <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                                                    <Checkbox
                                                        checked={selectedEmails.includes(email.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            if (e.currentTarget.checked) {
                                                                setSelectedEmails([...selectedEmails, email.id]);
                                                            } else {
                                                                setSelectedEmails(selectedEmails.filter(id => id !== email.id));
                                                            }
                                                        }}
                                                    />
                                                    
                                                    <Group gap="xs">
                                                        {email.isStarred && (
                                                            <IconStarFilled size={14} color="var(--mantine-color-yellow-6)" />
                                                        )}
                                                        {email.isFlagged && (
                                                            <IconFlagFilled size={14} color="var(--mantine-color-red-6)" />
                                                        )}
                                                    </Group>
                                                    
                                                    <Avatar size="sm" radius="xl">
                                                        {email.sender.name.charAt(0)}
                                                    </Avatar>
                                                    
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Group justify="space-between" align="center" mb="xs">
                                                            <Text fw={email.isRead ? 400 : 600} size="sm" truncate>
                                                                {email.sender.name}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                {formatDate(email.receivedAt)}
                                                            </Text>
                                                        </Group>
                                                        
                                                        <Text fw={email.isRead ? 400 : 600} size="sm" mb="xs" truncate>
                                                            {email.subject}
                                                        </Text>
                                                        
                                                        <Text size="sm" c="dimmed" lineClamp={1}>
                                                            {email.content.replace(/<[^>]*>/g, '')}
                                                        </Text>
                                                        
                                                        <Group gap="xs" mt="xs">
                                                            {email.attachments.length > 0 && (
                                                                <Group gap="xs">
                                                                    <IconPaperclip size={12} />
                                                                    <Text size="xs" c="dimmed">
                                                                        {email.attachments.length}
                                                                    </Text>
                                                                </Group>
                                                            )}
                                                            {email.priority !== 'normal' && (
                                                                <Badge
                                                                    color={getPriorityColor(email.priority)}
                                                                    variant="light"
                                                                    size="xs"
                                                                >
                                                                    {getPriorityLabel(email.priority)}
                                                                </Badge>
                                                            )}
                                                        </Group>
                                                    </div>
                                                </Group>
                                                
                                                <Menu shadow="md" width={200}>
                                                    <Menu.Target>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <IconDots size={16} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown>
                                                        <Menu.Item
                                                            leftSection={<IconStar size={16} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStar(email.id);
                                                            }}
                                                        >
                                                            {email.isStarred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={<IconFlag size={16} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFlag(email.id);
                                                            }}
                                                        >
                                                            {email.isFlagged ? 'Retirer le drapeau' : 'Marquer d\'un drapeau'}
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={<IconArchive size={16} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleArchive(email.id);
                                                            }}
                                                        >
                                                            Archiver
                                                        </Menu.Item>
                                                        <Menu.Divider />
                                                        <Menu.Item
                                                            leftSection={<IconTrash size={16} />}
                                                            color="red"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(email.id);
                                                            }}
                                                        >
                                                            Supprimer
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </Paper>
                    </Grid.Col>

                    {/* Colonne 3: Aperçu de l'email */}
                    <Grid.Col span={5}>
                        <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {selectedEmail ? (
                                <Stack gap="md" style={{ height: '100%' }}>
                                    {/* En-tête de l'email */}
                                    <Group justify="space-between" align="flex-start">
                                        <Group gap="md" style={{ flex: 1 }}>
                                            <Avatar size="md" radius="xl">
                                                {selectedEmail.sender.name.charAt(0)}
                                            </Avatar>
                                            <div style={{ flex: 1 }}>
                                                <Text fw={600} size="sm">
                                                    {selectedEmail.sender.name}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {selectedEmail.sender.email}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {formatDate(selectedEmail.receivedAt)}
                                                </Text>
                                            </div>
                                        </Group>
                                        
                                        <Group gap="xs">
                                            <ActionIcon
                                                variant="subtle"
                                                onClick={() => handleStar(selectedEmail.id)}
                                            >
                                                {selectedEmail.isStarred ? (
                                                    <IconStarFilled size={16} color="var(--mantine-color-yellow-6)" />
                                                ) : (
                                                    <IconStar size={16} />
                                                )}
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="subtle"
                                                onClick={() => handleFlag(selectedEmail.id)}
                                            >
                                                {selectedEmail.isFlagged ? (
                                                    <IconFlagFilled size={16} color="var(--mantine-color-red-6)" />
                                                ) : (
                                                    <IconFlag size={16} />
                                                )}
                                            </ActionIcon>
                                            <ActionIcon variant="subtle">
                                                <IconArrowBack size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle">
                                                <IconArrowForward size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>

                                    <Divider />

                                    {/* Objet */}
                                    <Text fw={600} size="lg">
                                        {selectedEmail.subject}
                                    </Text>

                                    {/* Pièces jointes */}
                                    {selectedEmail.attachments.length > 0 && (
                                        <div>
                                            <Text fw={600} size="sm" mb="xs">
                                                Pièces jointes ({selectedEmail.attachments.length})
                                            </Text>
                                            <Stack gap="xs">
                                                {selectedEmail.attachments.map((attachment, index) => (
                                                    <Paper key={index} p="sm" bg="gray.0" radius="md">
                                                        <Group justify="space-between">
                                                            <Group gap="sm">
                                                                <IconPaperclip size={16} />
                                                                <div>
                                                                    <Text size="sm" fw={500}>
                                                                        {attachment.name}
                                                                    </Text>
                                                                    <Text size="xs" c="dimmed">
                                                                        {formatFileSize(attachment.size)}
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                            <Button size="xs" variant="light" leftSection={<IconDownload size={14} />}>
                                                                Télécharger
                                                            </Button>
                                                        </Group>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        </div>
                                    )}

                                    {/* Contenu de l'email */}
                                    <ScrollArea style={{ flex: 1 }}>
                                        <div
                                            dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                                            style={{ lineHeight: 1.6 }}
                                        />
                                    </ScrollArea>

                                    {/* Actions */}
                                    <Group justify="flex-end" mt="auto">
                                        <Button
                                            leftSection={<IconArrowBack size={16} />}
                                        >
                                            Répondre
                                        </Button>
                                        <Button
                                            leftSection={<IconArrowForward size={16} />}
                                            variant="light"
                                        >
                                            Transférer
                                        </Button>
                                    </Group>
                                </Stack>
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: '100%',
                                    flexDirection: 'column',
                                    gap: 'md'
                                }}>
                                    <IconMail size={48} color="var(--mantine-color-gray-4)" />
                                    <Text c="dimmed" size="lg">
                                        Sélectionnez un email pour le lire
                                    </Text>
                                </div>
                            )}
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Modal de composition */}
                <Modal
                    opened={isComposeModalOpen}
                    onClose={() => setIsComposeModalOpen(false)}
                    title="Nouveau message"
                    size="lg"
                >
                    <Stack gap="md">
                        <TextInput
                            label="À"
                            placeholder="Destinataires"
                            required
                        />
                        <TextInput
                            label="CC"
                            placeholder="Copie carbone (optionnel)"
                        />
                        <TextInput
                            label="Objet"
                            placeholder="Objet du message"
                            required
                        />
                        <Textarea
                            label="Message"
                            placeholder="Tapez votre message ici..."
                            rows={10}
                            required
                        />
                        <Group justify="space-between">
                            <Group>
                                <Button
                                    leftSection={<IconPaperclip size={16} />}
                                    variant="light"
                                    size="sm"
                                >
                                    Joindre un fichier
                                </Button>
                            </Group>
                            <Group>
                                <Button
                                    variant="light"
                                    onClick={() => setIsComposeModalOpen(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    leftSection={<IconEdit size={16} />}
                                    variant="light"
                                >
                                    Brouillon
                                </Button>
                                <Button
                                    leftSection={<IconSend size={16} />}
                                >
                                    Envoyer
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </Modal>
        </MainLayout>
    );
};

export default EmailsPage;
