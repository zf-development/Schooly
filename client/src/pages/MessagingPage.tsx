import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Title,
    Group,
    ThemeIcon,
    Stack,
    Text,
    Button,
    TextInput,
    Textarea,
    ActionIcon,
    Box,
    Center,
    Loader,
    Avatar,
    ScrollArea,
    UnstyledButton,
    useMantineTheme,
    rem,
    Flex,
    Divider,
    Badge,
    Menu,
    Modal,
    Tabs,
    Paper,
    SimpleGrid,
    Grid,
    Card,
    List,
    Collapse
} from '@mantine/core';
import {
    IconMessage,
    IconPlus,
    IconSearch,
    IconSend,
    IconDots,
    IconPin,
    IconPinFilled,
    IconArchive,
    IconTrash,
    IconUser,
    IconUsers,
    IconCheck,
    IconChecks,
    IconPhoto,
    IconPaperclip,
    IconMoodSmile,
    IconPhone,
    IconVideo,
    IconInfoCircle,
    IconX,
    IconSettings,
    IconBell,
    IconBellOff,
    IconVolume,
    IconVolumeOff,
    IconEdit,
    IconCopy,
    IconShare,
    IconDownload,
    IconStar,
    IconStarFilled,
    IconHeart,
    IconThumbUp,
    IconThumbDown,
    IconFlag,
    IconFlagFilled,
    IconDotsVertical,
    IconChevronDown,
    IconChevronRight,
    IconFolder,
    IconFolderOpen,
    IconRefresh,
    IconSortAscending,
    IconSortDescending
} from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';

// Types
interface User {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: User;
    timestamp: Date;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    type: 'text' | 'image' | 'file' | 'voice';
    replyTo?: Message;
    reactions?: { emoji: string; users: string[] }[];
    isEdited?: boolean;
    editedAt?: Date;
}

interface Conversation {
    id: string;
    name: string;
    avatar?: string;
    isGroup: boolean;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    isPinned: boolean;
    isArchived: boolean;
    isMuted: boolean;
    updatedAt: Date;
    createdAt: Date;
    type: 'direct' | 'group' | 'channel';
    description?: string;
    admins?: string[];
}

// Données placeholder
const currentUser: User = {
    id: '1',
    name: 'Moi',
    avatar: '',
    isOnline: true
};

const mockUsers: User[] = [
    { id: '2', name: 'Marie Martin', avatar: '', isOnline: true },
    { id: '3', name: 'Pierre Dubois', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '4', name: 'Sophie Leroy', avatar: '', isOnline: true },
    { id: '5', name: 'Thomas Moreau', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '6', name: 'Emma Rousseau', avatar: '', isOnline: true },
    { id: '7', name: 'Lucas Petit', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

const mockConversations: Conversation[] = [
    {
        id: '1',
        name: 'Marie Martin',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[0]],
        lastMessage: {
            id: '1',
            content: 'Salut ! Comment ça va ?',
            senderId: '2',
            sender: mockUsers[0],
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: true,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        type: 'direct'
    },
    {
        id: '2',
        name: 'Groupe Projet Final',
        avatar: '',
        isGroup: true,
        participants: [currentUser, mockUsers[1], mockUsers[2], mockUsers[3]],
        lastMessage: {
            id: '2',
            content: 'On se retrouve demain à 14h pour la présentation ?',
            senderId: '3',
            sender: mockUsers[1],
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: 'delivered',
            type: 'text'
        },
        unreadCount: 3,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 15),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        type: 'group',
        description: 'Discussion pour le projet de fin d\'études',
        admins: ['1', '3']
    },
    {
        id: '3',
        name: 'Sophie Leroy',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[2]],
        lastMessage: {
            id: '3',
            content: 'Merci pour les notes !',
            senderId: '4',
            sender: mockUsers[2],
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        type: 'direct'
    },
    {
        id: '4',
        name: 'Cours Mathématiques',
        avatar: '',
        isGroup: true,
        participants: [currentUser, mockUsers[4], mockUsers[5], mockUsers[0]],
        lastMessage: {
            id: '4',
            content: 'L\'examen est reporté à la semaine prochaine',
            senderId: '6',
            sender: mockUsers[4],
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            status: 'delivered',
            type: 'text'
        },
        unreadCount: 1,
        isPinned: true,
        isArchived: false,
        isMuted: true,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        type: 'channel',
        description: 'Canal officiel du cours de mathématiques',
        admins: ['6']
    },
    {
        id: '5',
        name: 'Thomas Moreau',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[3]],
        lastMessage: {
            id: '5',
            content: 'À bientôt !',
            senderId: '5',
            sender: mockUsers[3],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        type: 'direct'
    }
];

const mockMessages: { [conversationId: string]: Message[] } = {
    '1': [
        {
            id: '1',
            content: 'Salut ! Comment ça va ?',
            senderId: '2',
            sender: mockUsers[0],
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            status: 'read',
            type: 'text'
        },
        {
            id: '2',
            content: 'Ça va bien merci ! Et toi ?',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 4),
            status: 'read',
            type: 'text'
        },
        {
            id: '3',
            content: 'Très bien aussi ! Tu viens à la réunion demain ?',
            senderId: '2',
            sender: mockUsers[0],
            timestamp: new Date(Date.now() - 1000 * 60 * 3),
            status: 'read',
            type: 'text'
        }
    ],
    '2': [
        {
            id: '1',
            content: 'Salut tout le monde !',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'read',
            type: 'text'
        },
        {
            id: '2',
            content: 'Salut !',
            senderId: '3',
            sender: mockUsers[1],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'read',
            type: 'text'
        },
        {
            id: '3',
            content: 'On se retrouve demain à 14h pour la présentation ?',
            senderId: '3',
            sender: mockUsers[1],
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: 'delivered',
            type: 'text'
        }
    ]
};

const MessagingPage: React.FC = () => {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'pinned'>('all');
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>(mockMessages);
    const [modalOpened, setModalOpened] = useState(false);
    const [newConversationName, setNewConversationName] = useState('');
    const [newConversationType, setNewConversationType] = useState<'direct' | 'group'>('direct');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filtrage des conversations
    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || 
                          (activeTab === 'unread' && conv.unreadCount > 0) ||
                          (activeTab === 'pinned' && conv.isPinned);
        return matchesSearch && matchesTab && !conv.isArchived;
    });

    const sortedConversations = [...filteredConversations].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 1000 * 60) return 'Maintenant';
        if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m`;
        if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const formatMessageTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const message: Message = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: currentUser.id,
            sender: currentUser,
            timestamp: new Date(),
            status: 'sending',
            type: 'text'
        };

        setMessages(prev => ({
            ...prev,
            [selectedConversation.id]: [...(prev[selectedConversation.id] || []), message]
        }));

        setNewMessage('');

        // Simuler l'envoi
        setTimeout(() => {
            setMessages(prev => ({
                ...prev,
                [selectedConversation.id]: prev[selectedConversation.id].map(m => 
                    m.id === message.id ? { ...m, status: 'sent' } : m
                )
            }));
        }, 1000);
    };

    const handleStartVideoCall = () => {
        // Rediriger vers la page d'appel vidéo
        window.location.href = '/video-call';
    };

    const handleCreateConversation = () => {
        if (!newConversationName.trim()) return;

        const newConv: Conversation = {
            id: Date.now().toString(),
            name: newConversationName,
            isGroup: newConversationType === 'group',
            participants: [currentUser],
            unreadCount: 0,
            isPinned: false,
            isArchived: false,
            isMuted: false,
            updatedAt: new Date(),
            createdAt: new Date(),
            type: newConversationType === 'group' ? 'group' : 'direct'
        };

        setConversations(prev => [newConv, ...prev]);
        setNewConversationName('');
        setModalOpened(false);
    };

    const handlePinConversation = (conversationId: string) => {
        setConversations(prev => prev.map(conv => 
            conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
        ));
    };

    const handleArchiveConversation = (conversationId: string) => {
        setConversations(prev => prev.map(conv => 
            conv.id === conversationId ? { ...conv, isArchived: true } : conv
        ));
    };

    const handleMuteConversation = (conversationId: string) => {
        setConversations(prev => prev.map(conv => 
            conv.id === conversationId ? { ...conv, isMuted: !conv.isMuted } : conv
        ));
    };

    // Auto-scroll vers le bas des messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation, messages]);

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="md" px="md">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconMessage size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Messagerie
                            </Title>
                            <Text c="dimmed" size="sm">
                                Communiquez avec vos collègues et amis
                            </Text>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setModalOpened(true)}
                            variant="light"
                        >
                            Nouvelle conversation
                        </Button>
                    </Group>
                </Group>

                {/* Interface de messagerie - 2 colonnes */}
                <Grid gutter={0} style={{ height: 'calc(100vh - 200px)' }}>
                    {/* Colonne 1: Liste des conversations */}
                    <Grid.Col span={4} style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
                        <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Stack gap="md" h="100%">
                                {/* Barre de recherche */}
                                <TextInput
                                    placeholder="Rechercher une conversation..."
                                    leftSection={<IconSearch size={16} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    size="sm"
                                />

                                {/* Onglets de filtrage */}
                                <Tabs value={activeTab} onChange={(value) => setActiveTab((value as 'all' | 'unread' | 'pinned') || 'all')}>
                                    <Tabs.List>
                                        <Tabs.Tab value="all">Toutes</Tabs.Tab>
                                        <Tabs.Tab value="unread">Non lues</Tabs.Tab>
                                        <Tabs.Tab value="pinned">Épinglées</Tabs.Tab>
                                    </Tabs.List>
                                </Tabs>

                                {/* Liste des conversations */}
                                <ScrollArea style={{ flex: 1 }}>
                                    <Stack gap={0}>
                                        {sortedConversations.map((conv) => (
                                            <UnstyledButton
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                                style={{
                                                    padding: '12px',
                                                    backgroundColor: selectedConversation?.id === conv.id ? 
                                                        'var(--mantine-color-blue-0)' : 'transparent',
                                                    borderLeft: selectedConversation?.id === conv.id ? 
                                                        '3px solid var(--mantine-color-blue-6)' : '3px solid transparent',
                                                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedConversation?.id !== conv.id) {
                                                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedConversation?.id !== conv.id) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                <Group justify="space-between" align="flex-start">
                                                    <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
                                                        <Avatar size="md" radius="xl" src={conv.avatar}>
                                                            {conv.name.charAt(0)}
                                                        </Avatar>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <Group justify="space-between" align="center" mb="xs">
                                                                <Text fw={conv.unreadCount > 0 ? 600 : 400} size="sm" truncate>
                                                                    {conv.name}
                                                                </Text>
                                                                <Group gap="xs">
                                                                    {conv.isPinned && (
                                                                        <IconPinFilled size={14} color="var(--mantine-color-yellow-6)" />
                                                                    )}
                                                                    {conv.isMuted && (
                                                                        <IconBellOff size={14} color="var(--mantine-color-gray-5)" />
                                                                    )}
                                                                    <Text size="xs" c="dimmed">
                                                                        {formatTime(conv.updatedAt)}
                                                                    </Text>
                                                                </Group>
                                                            </Group>
                                                            <Text size="sm" c="dimmed" lineClamp={1}>
                                                                {conv.lastMessage?.content || 'Aucun message'}
                                                            </Text>
                                                            {conv.isGroup && (
                                                                <Group gap="xs" mt="xs">
                                                                    <IconUsers size={12} />
                                                                    <Text size="xs" c="dimmed">
                                                                        {conv.participants.length} membres
                                                                    </Text>
                                                                </Group>
                                                            )}
                                                        </div>
                                                    </Group>
                                                    <Group gap="xs">
                                                        {conv.unreadCount > 0 && (
                                                            <Badge size="sm" color="blue" variant="filled">
                                                                {conv.unreadCount}
                                                            </Badge>
                                                        )}
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
                                                                    leftSection={<IconPin size={16} />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePinConversation(conv.id);
                                                                    }}
                                                                >
                                                                    {conv.isPinned ? 'Désépingler' : 'Épingler'}
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    leftSection={conv.isMuted ? <IconBell size={16} /> : <IconBellOff size={16} />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMuteConversation(conv.id);
                                                                    }}
                                                                >
                                                                    {conv.isMuted ? 'Activer les notifications' : 'Désactiver les notifications'}
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    leftSection={<IconArchive size={16} />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleArchiveConversation(conv.id);
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
                                                                        // Supprimer la conversation
                                                                    }}
                                                                >
                                                                    Supprimer
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </Group>
                                            </UnstyledButton>
                                        ))}
                                    </Stack>
                                </ScrollArea>
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    {/* Colonne 2: Chat */}
                    <Grid.Col span={8}>
                        <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {selectedConversation ? (
                                <Stack gap="md" h="100%">
                                    {/* En-tête du chat */}
                                    <Group justify="space-between" align="center">
                                        <Group gap="md">
                                            <Avatar size="md" radius="xl" src={selectedConversation.avatar}>
                                                {selectedConversation.name.charAt(0)}
                                            </Avatar>
                                            <div>
                                                <Text fw={600} size="sm">
                                                    {selectedConversation.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {selectedConversation.isGroup ? 
                                                        `${selectedConversation.participants.length} membres` : 
                                                        'En ligne'
                                                    }
                                                </Text>
                                            </div>
                                        </Group>
                                        <Group gap="xs">
                                            <ActionIcon variant="subtle">
                                                <IconPhone size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle" onClick={handleStartVideoCall}>
                                                <IconVideo size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle">
                                                <IconInfoCircle size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>

                                    <Divider />

                                    {/* Zone des messages */}
                                    <ScrollArea style={{ flex: 1 }} ref={messagesEndRef}>
                                        <Stack gap="md" pb="md">
                                            {(messages[selectedConversation.id] || []).map((message) => (
                                                <Group
                                                    key={message.id}
                                                    justify={message.senderId === currentUser.id ? 'flex-end' : 'flex-start'}
                                                    align="flex-start"
                                                    gap="sm"
                                                >
                                                    {message.senderId !== currentUser.id && (
                                                        <Avatar size="sm" radius="xl" src={message.sender.avatar}>
                                                            {message.sender.name.charAt(0)}
                                                        </Avatar>
                                                    )}
                                                    <Box
                                                        style={{
                                                            maxWidth: '70%',
                                                            backgroundColor: message.senderId === currentUser.id ? 
                                                                'var(--mantine-color-blue-6)' : 
                                                                'var(--mantine-color-gray-1)',
                                                            color: message.senderId === currentUser.id ? 
                                                                'white' : 'var(--mantine-color-gray-8)',
                                                            padding: '8px 12px',
                                                            borderRadius: '12px',
                                                            borderBottomRightRadius: message.senderId === currentUser.id ? '4px' : '12px',
                                                            borderBottomLeftRadius: message.senderId === currentUser.id ? '12px' : '4px',
                                                        }}
                                                    >
                                                        <Text size="sm" style={{ wordBreak: 'break-word' }}>
                                                            {message.content}
                                                        </Text>
                                                        <Group justify="space-between" align="center" mt="xs">
                                                            <Text size="xs" c={message.senderId === currentUser.id ? 'rgba(255,255,255,0.7)' : 'dimmed'}>
                                                                {formatMessageTime(message.timestamp)}
                                                            </Text>
                                                            {message.senderId === currentUser.id && (
                                                                <Group gap="xs">
                                                                    {message.status === 'sending' && <Loader size="xs" />}
                                                                    {message.status === 'sent' && <IconCheck size={12} />}
                                                                    {message.status === 'delivered' && <IconChecks size={12} />}
                                                                    {message.status === 'read' && <IconChecks size={12} color="var(--mantine-color-blue-6)" />}
                                                                </Group>
                                                            )}
                                                        </Group>
                                                    </Box>
                                                </Group>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </Stack>
                                    </ScrollArea>

                                    <Divider />

                                    {/* Zone de saisie */}
                                    <Group gap="sm" align="flex-end">
                                        <ActionIcon variant="subtle">
                                            <IconPaperclip size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="subtle">
                                            <IconPhoto size={16} />
                                        </ActionIcon>
                                        <Textarea
                                            placeholder="Tapez votre message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            style={{ flex: 1 }}
                                            minRows={1}
                                            maxRows={4}
                                            autosize
                                        />
                                        <ActionIcon variant="subtle">
                                            <IconMoodSmile size={16} />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="filled"
                                            color="blue"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                        >
                                            <IconSend size={16} />
                                        </ActionIcon>
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
                                    <IconMessage size={48} color="var(--mantine-color-gray-4)" />
                                    <Text c="dimmed" size="lg">
                                        Sélectionnez une conversation
                                    </Text>
                                    <Text c="dimmed" size="sm" ta="center">
                                        Choisissez une conversation dans la liste pour commencer à discuter
                                    </Text>
                                </div>
                            )}
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Modal de nouvelle conversation */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title="Nouvelle conversation"
                    size="sm"
                >
                    <Stack gap="md">
                        <TextInput
                            label="Nom de la conversation"
                            placeholder="Nom de la conversation"
                            value={newConversationName}
                            onChange={(e) => setNewConversationName(e.target.value)}
                            required
                        />

                        <Tabs value={newConversationType} onChange={(value) => setNewConversationType(value as 'direct' | 'group')}>
                            <Tabs.List>
                                <Tabs.Tab value="direct" leftSection={<IconUser size={16} />}>
                                    Message privé
                                </Tabs.Tab>
                                <Tabs.Tab value="group" leftSection={<IconUsers size={16} />}>
                                    Groupe
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs>

                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={() => setModalOpened(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleCreateConversation} color="violet">
                                Créer
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
        </MainLayout>
    );
};

export default MessagingPage;