import React, { useState, useEffect, useRef } from 'react';
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
    Paper,
    Divider,
    Center,
    Loader,
    Menu,
    Avatar,
    ScrollArea,
    Flex,
    Tabs,
    Input,
    Alert
} from '@mantine/core';
import {
    IconMessage,
    IconPlus,
    IconEdit,
    IconTrash,
    IconSearch,
    IconSend,
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
    IconUser,
    IconUsers,
    IconBell,
    IconBellOff,
    IconCheck,
    IconChecks,
    IconPhoto,
    IconPaperclip,
    IconMoodSmile,
    IconPhone,
    IconVideo,
    IconInfoCircle
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: Date;
    isRead: boolean;
    isEdited?: boolean;
    editedAt?: Date;
    attachments?: Attachment[];
    reactions?: Reaction[];
}

interface Conversation {
    id: string;
    name: string;
    type: 'direct' | 'group';
    participants: Participant[];
    lastMessage?: Message;
    unreadCount: number;
    isPinned: boolean;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    avatar?: string;
}

interface Participant {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
    role?: 'admin' | 'member';
}

interface Attachment {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
}

interface Reaction {
    emoji: string;
    userId: string;
    userName: string;
}

const MessagingPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<string>('all');
    const [modalOpened, setModalOpened] = useState(false);
    const [newConversationName, setNewConversationName] = useState('');
    const [newConversationType, setNewConversationType] = useState<'direct' | 'group'>('direct');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Données d'exemple
    useEffect(() => {
        const sampleConversations: Conversation[] = [
            {
                id: '1',
                name: 'Marie Dubois',
                type: 'direct',
                participants: [
                    {
                        id: '2',
                        name: 'Marie Dubois',
                        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                        isOnline: true,
                        lastSeen: new Date()
                    }
                ],
                lastMessage: {
                    id: 'm1',
                    content: 'Salut ! Comment ça va ?',
                    senderId: '2',
                    senderName: 'Marie Dubois',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                    isRead: false
                },
                unreadCount: 2,
                isPinned: true,
                isArchived: false,
                createdAt: new Date('2024-11-01'),
                updatedAt: new Date(Date.now() - 1000 * 60 * 30)
            },
            {
                id: '2',
                name: 'Projet Web',
                type: 'group',
                participants: [
                    {
                        id: '3',
                        name: 'Pierre Martin',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                        isOnline: false,
                        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                        role: 'admin'
                    },
                    {
                        id: '4',
                        name: 'Sophie Laurent',
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                        isOnline: true,
                        lastSeen: new Date(),
                        role: 'member'
                    }
                ],
                lastMessage: {
                    id: 'm2',
                    content: 'J\'ai terminé la partie backend, vous pouvez tester !',
                    senderId: '3',
                    senderName: 'Pierre Martin',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                    isRead: true
                },
                unreadCount: 0,
                isPinned: false,
                isArchived: false,
                createdAt: new Date('2024-11-05'),
                updatedAt: new Date(Date.now() - 1000 * 60 * 60),
                avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop&crop=face'
            },
            {
                id: '3',
                name: 'Cours Mathématiques',
                type: 'group',
                participants: [
                    {
                        id: '5',
                        name: 'Prof. Durand',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                        isOnline: false,
                        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                        role: 'admin'
                    },
                    {
                        id: '6',
                        name: 'Lucas Moreau',
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                        isOnline: true,
                        lastSeen: new Date(),
                        role: 'member'
                    }
                ],
                lastMessage: {
                    id: 'm3',
                    content: 'N\'oubliez pas l\'examen de demain !',
                    senderId: '5',
                    senderName: 'Prof. Durand',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                    isRead: true
                },
                unreadCount: 0,
                isPinned: false,
                isArchived: false,
                createdAt: new Date('2024-10-15'),
                updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
            }
        ];

        setConversations(sampleConversations);
    }, []);

    // Messages d'exemple pour la conversation sélectionnée
    useEffect(() => {
        if (selectedConversation) {
            const sampleMessages: Message[] = [
                {
                    id: 'm1',
                    content: 'Salut ! Comment ça va ?',
                    senderId: '2',
                    senderName: 'Marie Dubois',
                    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                    isRead: true
                },
                {
                    id: 'm2',
                    content: 'Ça va bien merci ! Et toi ?',
                    senderId: user?.id || '1',
                    senderName: user?.display_name || 'Moi',
                    senderAvatar: user?.avatar_url,
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
                    isRead: true
                },
                {
                    id: 'm3',
                    content: 'Très bien aussi ! Tu as vu le nouveau projet qu\'on doit faire ?',
                    senderId: '2',
                    senderName: 'Marie Dubois',
                    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                    isRead: true
                },
                {
                    id: 'm4',
                    content: 'Oui, il a l\'air intéressant ! On pourrait se réunir demain pour en discuter ?',
                    senderId: user?.id || '1',
                    senderName: user?.display_name || 'Moi',
                    senderAvatar: user?.avatar_url,
                    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                    isRead: true
                },
                {
                    id: 'm5',
                    content: 'Parfait ! 14h ça te va ?',
                    senderId: '2',
                    senderName: 'Marie Dubois',
                    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                    isRead: false
                }
            ];
            setMessages(sampleMessages);
        }
    }, [selectedConversation, user]);

    // Auto-scroll vers le bas quand de nouveaux messages arrivent
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!user) {
        return (
            <MainLayout>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const message: Message = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: user.id,
            senderName: user.display_name || 'Moi',
            senderAvatar: user.avatar_url,
            timestamp: new Date(),
            isRead: false
        };

        setMessages([...messages, message]);
        setNewMessage('');

        // Mettre à jour la conversation
        setConversations(conversations.map(conv => 
            conv.id === selectedConversation.id 
                ? { ...conv, lastMessage: message, updatedAt: new Date() }
                : conv
        ));
    };

    const handleCreateConversation = () => {
        if (!newConversationName.trim()) return;

        const newConversation: Conversation = {
            id: Date.now().toString(),
            name: newConversationName,
            type: newConversationType,
            participants: [],
            unreadCount: 0,
            isPinned: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setConversations([newConversation, ...conversations]);
        setNewConversationName('');
        setModalOpened(false);
    };

    const handleTogglePin = (conversationId: string) => {
        setConversations(conversations.map(conv => 
            conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
        ));
    };

    const handleArchiveConversation = (conversationId: string) => {
        setConversations(conversations.map(conv => 
            conv.id === conversationId ? { ...conv, isArchived: !conv.isArchived } : conv
        ));
    };

    const handleDeleteConversation = (conversationId: string) => {
        setConversations(conversations.filter(conv => conv.id !== conversationId));
        if (selectedConversation?.id === conversationId) {
            setSelectedConversation(null);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTab = activeTab === 'all' || 
                          (activeTab === 'unread' && conv.unreadCount > 0) ||
                          (activeTab === 'pinned' && conv.isPinned) ||
                          (activeTab === 'archived' && conv.isArchived);

        return matchesSearch && matchesTab && !conv.isArchived;
    });

    const sortedConversations = [...filteredConversations].sort((a, b) => {
        // Les conversations épinglées en premier
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Puis par date de dernière activité
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

    return (
        <MainLayout>
            <Container size="xl" py="md">
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
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
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setModalOpened(true)}
                        color="violet"
                    >
                        Nouvelle conversation
                    </Button>
                </Group>

                <Grid>
                    {/* Liste des conversations */}
                    <Grid.Col span={4}>
                        <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                            {/* Recherche */}
                            <TextInput
                                placeholder="Rechercher des conversations..."
                                leftSection={<IconSearch size={16} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                mb="md"
                            />

                            {/* Onglets */}
                            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')} mb="md">
                                <Tabs.List>
                                    <Tabs.Tab value="all">Toutes</Tabs.Tab>
                                    <Tabs.Tab value="unread">Non lues</Tabs.Tab>
                                    <Tabs.Tab value="pinned">Épinglées</Tabs.Tab>
                                    <Tabs.Tab value="archived">Archivées</Tabs.Tab>
                                </Tabs.List>
                            </Tabs>

                            {/* Liste des conversations */}
                            <ScrollArea h="calc(100vh - 300px)">
                                <Stack gap="xs">
                                    {sortedConversations.map(conversation => (
                                        <Paper
                                            key={conversation.id}
                                            p="md"
                                            radius="md"
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedConversation?.id === conversation.id ? '2px solid var(--mantine-color-violet-3)' : '1px solid var(--mantine-color-gray-3)',
                                                backgroundColor: selectedConversation?.id === conversation.id ? 'var(--mantine-color-violet-0)' : 'transparent'
                                            }}
                                            onClick={() => setSelectedConversation(conversation)}
                                        >
                                            <Group justify="space-between" align="flex-start" mb="sm">
                                                <Group>
                                                    <Avatar
                                                        src={conversation.avatar || conversation.participants[0]?.avatar}
                                                        size="md"
                                                        radius="md"
                                                    >
                                                        {conversation.type === 'group' ? (
                                                            <IconUsers size={20} />
                                                        ) : (
                                                            <IconUser size={20} />
                                                        )}
                                                    </Avatar>
                                                    <Box>
                                                        <Group align="center" gap="xs">
                                                            <Text fw={500} size="sm" truncate>
                                                                {conversation.name}
                                                            </Text>
                                                            {conversation.isPinned && (
                                                                <IconPinFilled size={12} color="var(--mantine-color-violet-6)" />
                                                            )}
                                                        </Group>
                                                        <Text size="xs" c="dimmed">
                                                            {conversation.type === 'group' ? 'Groupe' : 'Message privé'} • 
                                                            {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
                                                        </Text>
                                                    </Box>
                                                </Group>
                                                <Group gap="xs">
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge size="sm" color="violet" variant="filled">
                                                            {conversation.unreadCount}
                                                        </Badge>
                                                    )}
                                                    <Menu>
                                                        <Menu.Target>
                                                            <ActionIcon size="sm" variant="subtle">
                                                                <IconDots size={12} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item 
                                                                leftSection={conversation.isPinned ? <IconPin size={14} /> : <IconPinFilled size={14} />}
                                                                onClick={() => handleTogglePin(conversation.id)}
                                                            >
                                                                {conversation.isPinned ? 'Désépingler' : 'Épingler'}
                                                            </Menu.Item>
                                                            <Menu.Item 
                                                                leftSection={<IconArchive size={14} />}
                                                                onClick={() => handleArchiveConversation(conversation.id)}
                                                            >
                                                                Archiver
                                                            </Menu.Item>
                                                            <Menu.Divider />
                                                            <Menu.Item 
                                                                leftSection={<IconTrash size={14} />}
                                                                color="red"
                                                                onClick={() => handleDeleteConversation(conversation.id)}
                                                            >
                                                                Supprimer
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Group>
                                            </Group>

                                            {conversation.lastMessage && (
                                                <Group justify="space-between" align="center">
                                                    <Text size="xs" c="dimmed" truncate>
                                                        {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {formatTime(conversation.lastMessage.timestamp)}
                                                    </Text>
                                                </Group>
                                            )}
                                        </Paper>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </Card>
                    </Grid.Col>

                    {/* Zone de chat */}
                    <Grid.Col span={8}>
                        <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                            {selectedConversation ? (
                                <Stack h="100%">
                                    {/* En-tête de la conversation */}
                                    <Group justify="space-between" align="center" mb="md">
                                        <Group>
                                            <Avatar
                                                src={selectedConversation.avatar || selectedConversation.participants[0]?.avatar}
                                                size="md"
                                                radius="md"
                                            >
                                                {selectedConversation.type === 'group' ? (
                                                    <IconUsers size={20} />
                                                ) : (
                                                    <IconUser size={20} />
                                                )}
                                            </Avatar>
                                            <Box>
                                                <Text fw={500} size="lg">
                                                    {selectedConversation.name}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {selectedConversation.type === 'group' ? 'Groupe' : 'Message privé'} • 
                                                    {selectedConversation.participants.length} participant{selectedConversation.participants.length !== 1 ? 's' : ''}
                                                </Text>
                                            </Box>
                                        </Group>
                                        <Group gap="xs">
                                            <ActionIcon variant="light">
                                                <IconPhone size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="light">
                                                <IconVideo size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="light">
                                                <IconInfoCircle size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>

                                    <Divider />

                                    {/* Messages */}
                                    <ScrollArea h="calc(100vh - 400px)" style={{ flex: 1 }}>
                                        <Stack gap="md" p="md">
                                            {messages.map(message => (
                                                <Group
                                                    key={message.id}
                                                    justify={message.senderId === user.id ? 'flex-end' : 'flex-start'}
                                                    align="flex-start"
                                                >
                                                    {message.senderId !== user.id && (
                                                        <Avatar
                                                            src={message.senderAvatar}
                                                            size="sm"
                                                            radius="md"
                                                        />
                                                    )}
                                                    <Box
                                                        style={{
                                                            maxWidth: '70%',
                                                            backgroundColor: message.senderId === user.id 
                                                                ? 'var(--mantine-color-violet-1)' 
                                                                : 'var(--mantine-color-gray-1)',
                                                            padding: '8px 12px',
                                                            borderRadius: '12px',
                                                            border: message.senderId === user.id 
                                                                ? '1px solid var(--mantine-color-violet-3)' 
                                                                : '1px solid var(--mantine-color-gray-3)'
                                                        }}
                                                    >
                                                        <Text size="sm">
                                                            {message.content}
                                                        </Text>
                                                        <Group justify="space-between" align="center" mt="xs">
                                                            <Text size="xs" c="dimmed">
                                                                {formatMessageTime(message.timestamp)}
                                                            </Text>
                                                            {message.senderId === user.id && (
                                                                <Group gap="xs">
                                                                    {message.isRead ? (
                                                                        <IconChecks size={12} color="var(--mantine-color-violet-6)" />
                                                                    ) : (
                                                                        <IconCheck size={12} color="var(--mantine-color-gray-6)" />
                                                                    )}
                                                                </Group>
                                                            )}
                                                        </Group>
                                                    </Box>
                                                    {message.senderId === user.id && (
                                                        <Avatar
                                                            src={message.senderAvatar}
                                                            size="sm"
                                                            radius="md"
                                                        />
                                                    )}
                                                </Group>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </Stack>
                                    </ScrollArea>

                                    <Divider />

                                    {/* Zone de saisie */}
                                    <Group align="flex-end" gap="sm">
                                        <ActionIcon variant="light">
                                            <IconPaperclip size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="light">
                                            <IconPhoto size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="light">
                                            <IconMoodSmile size={16} />
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
                                        <ActionIcon
                                            variant="filled"
                                            color="violet"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                        >
                                            <IconSend size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Stack>
                            ) : (
                                <Center h="100%">
                                    <Stack align="center" gap="md">
                                        <ThemeIcon size={64} radius="md" color="gray" variant="light">
                                            <IconMessage size={32} />
                                        </ThemeIcon>
                                        <Text size="lg" c="dimmed">
                                            Sélectionnez une conversation
                                        </Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            Choisissez une conversation dans la liste pour commencer à discuter
                                        </Text>
                                    </Stack>
                                </Center>
                            )}
                        </Card>
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
            </Container>
        </MainLayout>
    );
};

export default MessagingPage;
