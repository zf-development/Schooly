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
    SimpleGrid
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
    IconEdit
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
    type: 'text' | 'image' | 'file';
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
    isOnline?: boolean;
}

interface Participant {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
    role?: 'admin' | 'member';
}

const MessagingPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const theme = useMantineTheme();
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
                    timestamp: new Date(Date.now() - 1000 * 60 * 30),
                    isRead: false,
                    type: 'text'
                },
                unreadCount: 2,
                isPinned: true,
                isArchived: false,
                createdAt: new Date('2024-11-01'),
                updatedAt: new Date(Date.now() - 1000 * 60 * 30),
                isOnline: true
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
                        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
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
                    timestamp: new Date(Date.now() - 1000 * 60 * 60),
                    isRead: true,
                    type: 'text'
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
                name: 'Équipe Design',
                type: 'group',
                participants: [
                    {
                        id: '5',
                        name: 'Lucas Moreau',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                        isOnline: true,
                        lastSeen: new Date(),
                        role: 'admin'
                    }
                ],
                lastMessage: {
                    id: 'm3',
                    content: 'Nouveaux mockups disponibles !',
                    senderId: '5',
                    senderName: 'Lucas Moreau',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
                    isRead: true,
                    type: 'text'
                },
                unreadCount: 0,
                isPinned: false,
                isArchived: false,
                createdAt: new Date('2024-11-10'),
                updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
                avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop&crop=face'
            }
        ];

        setConversations(sampleConversations);
    }, []);

    // Messages d'exemple
    useEffect(() => {
        if (selectedConversation) {
            const sampleMessages: Message[] = [
                {
                    id: 'm1',
                    content: 'Salut ! Comment ça va ?',
                    senderId: '2',
                    senderName: 'Marie Dubois',
                    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    isRead: true,
                    type: 'text'
                },
                {
                    id: 'm2',
                    content: 'Ça va bien merci ! Et toi ?',
                    senderId: user?.id || '1',
                    senderName: user?.name || 'Moi',
                    senderAvatar: user?.avatar_url,
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
                    isRead: true,
                    type: 'text'
                },
                {
                    id: 'm3',
                    content: 'Très bien aussi ! Tu as vu le nouveau projet qu\'on doit faire ?',
                    senderId: '2',
                    senderName: 'Marie Dubois',
                    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60),
                    isRead: true,
                    type: 'text'
                }
            ];
            setMessages(sampleMessages);
        }
    }, [selectedConversation, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const message: Message = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: user.id,
            senderName: user.name || 'Moi',
            senderAvatar: user.avatar_url,
            timestamp: new Date(),
            isRead: false,
            type: 'text'
        };

        setMessages([...messages, message]);
        setNewMessage('');

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

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
            <Container size="xl" py="md">
                {/* En-tête cohérent avec le reste de la plateforme */}
                <Group mb="xl">
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

                {/* Interface de messagerie - 2 sections flottantes séparées */}
                <Flex gap="md" h="calc(100vh - 200px)">
                    {/* Section 1: Liste des conversations - Carte flottante */}
                    <Paper 
                        shadow="lg" 
                        radius="lg" 
                        w="350px"
                        h="100%"
                        style={{ 
                            background: theme.white,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Barre de recherche */}
                        <Box p="md" style={{ borderBottom: `1px solid ${theme.colors.gray[2]}` }}>
                            <TextInput
                                placeholder="Rechercher..."
                                leftSection={<IconSearch size={16} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                radius="md"
                                size="sm"
                            />

                            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')} mt="md">
                                <Tabs.List>
                                    <Tabs.Tab value="all" size="sm">Toutes</Tabs.Tab>
                                    <Tabs.Tab value="unread" size="sm">Non lues</Tabs.Tab>
                                    <Tabs.Tab value="pinned" size="sm">Épinglées</Tabs.Tab>
                                </Tabs.List>
                            </Tabs>
                        </Box>

                        {/* Liste des conversations */}
                        <ScrollArea h="calc(100% - 120px)">
                            <Stack gap={0}>
                                {sortedConversations.map((conversation) => (
                                    <UnstyledButton
                                        key={conversation.id}
                                        onClick={() => setSelectedConversation(conversation)}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: `1px solid ${theme.colors.gray[1]}`,
                                            backgroundColor: selectedConversation?.id === conversation.id 
                                                ? theme.colors.violet[0] 
                                                : 'transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedConversation?.id !== conversation.id) {
                                                e.currentTarget.style.backgroundColor = theme.colors.gray[0];
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedConversation?.id !== conversation.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <Group justify="space-between" align="flex-start">
                                            <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                                                <Box style={{ position: 'relative' }}>
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
                                                    {conversation.isOnline && (
                                                        <Box
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                right: 0,
                                                                width: 12,
                                                                height: 12,
                                                                backgroundColor: theme.colors.green[6],
                                                                borderRadius: '50%',
                                                                border: `2px solid ${theme.white}`
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                
                                                <Box style={{ flex: 1, minWidth: 0 }}>
                                                    <Group justify="space-between" align="center" mb={4}>
                                                        <Text fw={500} size="sm" truncate>
                                                            {conversation.name}
                                                        </Text>
                                                        <Group gap="xs">
                                                            {conversation.isPinned && (
                                                                <IconPinFilled size={12} color={theme.colors.violet[6]} />
                                                            )}
                                                            <Text size="xs" c="dimmed">
                                                                {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                                                            </Text>
                                                        </Group>
                                                    </Group>
                                                    
                                                    <Text size="xs" c="dimmed" truncate>
                                                        {conversation.lastMessage?.senderName}: {conversation.lastMessage?.content}
                                                    </Text>
                                                </Box>
                                            </Group>
                                            
                                            <Group gap="xs">
                                                {conversation.unreadCount > 0 && (
                                                    <Badge size="sm" color="violet" variant="filled" radius="xl">
                                                        {conversation.unreadCount}
                                                    </Badge>
                                                )}
                                                <Menu>
                                                    <Menu.Target>
                                                        <ActionIcon size="sm" variant="subtle" color="gray">
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
                                    </UnstyledButton>
                                ))}
                            </Stack>
                        </ScrollArea>
                    </Paper>

                    {/* Section 2: Zone de chat - Carte flottante */}
                    <Paper 
                        shadow="lg" 
                        radius="lg" 
                        style={{ 
                            flex: 1,
                            background: theme.white,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {selectedConversation ? (
                            <>
                                {/* En-tête de conversation */}
                                <Box p="md" style={{ borderBottom: `1px solid ${theme.colors.gray[2]}` }}>
                                    <Group justify="space-between" align="center">
                                        <Group gap="sm">
                                            <Box style={{ position: 'relative' }}>
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
                                                {selectedConversation.isOnline && (
                                                    <Box
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            right: 0,
                                                            width: 12,
                                                            height: 12,
                                                            backgroundColor: theme.colors.green[6],
                                                            borderRadius: '50%',
                                                            border: `2px solid ${theme.white}`
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Box>
                                                <Text fw={500} size="lg">
                                                    {selectedConversation.name}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {selectedConversation.isOnline ? 'En ligne' : 'Hors ligne'} • 
                                                    {selectedConversation.type === 'group' ? 'Groupe' : 'Message privé'}
                                                </Text>
                                            </Box>
                                        </Group>
                                        <Group gap="xs">
                                            <ActionIcon variant="light" color="gray" radius="md">
                                                <IconPhone size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="light" color="gray" radius="md">
                                                <IconVideo size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="light" color="gray" radius="md">
                                                <IconInfoCircle size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Box>

                                {/* Messages */}
                                <ScrollArea 
                                    style={{ 
                                        flex: 1,
                                        background: theme.colors.gray[0]
                                    }} 
                                    p="md"
                                >
                                    <Stack gap="md">
                                        {messages.map((message) => (
                                            <Group
                                                key={message.id}
                                                justify={message.senderId === user.id ? 'flex-end' : 'flex-start'}
                                                align="flex-start"
                                                gap="sm"
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
                                                            ? theme.colors.violet[6]
                                                            : theme.white,
                                                        color: message.senderId === user.id ? theme.white : theme.black,
                                                        padding: '12px 16px',
                                                        borderRadius: message.senderId === user.id 
                                                            ? '18px 18px 4px 18px'
                                                            : '18px 18px 18px 4px',
                                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                >
                                                    <Text size="sm" style={{ lineHeight: 1.4 }}>
                                                        {message.content}
                                                    </Text>
                                                    <Group justify="space-between" align="center" mt="xs" gap="xs">
                                                        <Text size="xs" c={message.senderId === user.id ? 'rgba(255,255,255,0.7)' : 'dimmed'}>
                                                            {formatMessageTime(message.timestamp)}
                                                        </Text>
                                                        {message.senderId === user.id && (
                                                            <Group gap="xs">
                                                                {message.isRead ? (
                                                                    <IconChecks size={12} color="rgba(255,255,255,0.8)" />
                                                                ) : (
                                                                    <IconCheck size={12} color="rgba(255,255,255,0.6)" />
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

                                {/* Zone de saisie */}
                                <Box p="md" style={{ borderTop: `1px solid ${theme.colors.gray[2]}` }}>
                                    <Group align="flex-end" gap="sm">
                                        <ActionIcon variant="light" color="gray" radius="md">
                                            <IconPaperclip size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="light" color="gray" radius="md">
                                            <IconPhoto size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="light" color="gray" radius="md">
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
                                            radius="md"
                                            size="sm"
                                        />
                                        <ActionIcon
                                            variant="filled"
                                            color="violet"
                                            radius="md"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            size="lg"
                                        >
                                            <IconSend size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Box>
                            </>
                        ) : (
                            <Center h="100%" style={{ background: theme.colors.gray[0] }}>
                                <Stack align="center" gap="md">
                                    <ThemeIcon size={80} radius="md" color="gray" variant="light">
                                        <IconMessage size={40} />
                                    </ThemeIcon>
                                    <Text size="xl" fw={500} c="dimmed">
                                        Sélectionnez une conversation
                                    </Text>
                                    <Text size="sm" c="dimmed" ta="center" maw={300}>
                                        Choisissez une conversation dans la liste pour commencer à discuter
                                    </Text>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        onClick={() => setModalOpened(true)}
                                        color="violet"
                                        radius="md"
                                    >
                                        Nouvelle conversation
                                    </Button>
                                </Stack>
                            </Center>
                        )}
                    </Paper>
                </Flex>

                {/* Modal de nouvelle conversation */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title="Nouvelle conversation"
                    size="sm"
                    radius="md"
                >
                    <Stack gap="md">
                        <TextInput
                            label="Nom de la conversation"
                            placeholder="Nom de la conversation"
                            value={newConversationName}
                            onChange={(e) => setNewConversationName(e.target.value)}
                            required
                            radius="md"
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
                            <Button variant="light" onClick={() => setModalOpened(false)} radius="md">
                                Annuler
                            </Button>
                            <Button onClick={handleCreateConversation} color="violet" radius="md">
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