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
    Collapse,
    MultiSelect,
    Select
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
    role: 'student' | 'teacher';
    class?: string; // Pour les étudiants
    subject?: string; // Pour les professeurs
    groupNumber?: string; // Numéro de groupe
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
    isOnline: true,
    role: 'student',
    class: '5e secondaire'
};

const mockUsers: User[] = [
    { id: '2', name: 'Marie Martin', avatar: '', isOnline: true, role: 'student', class: '5e secondaire', groupNumber: '5101' },
    { id: '3', name: 'Pierre Dubois', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 30), role: 'teacher', subject: 'Mathématiques', groupNumber: '5101' },
    { id: '4', name: 'Sophie Leroy', avatar: '', isOnline: true, role: 'student', class: '4e secondaire', groupNumber: '4101' },
    { id: '5', name: 'Thomas Moreau', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), role: 'student', class: '5e secondaire', groupNumber: '5102' },
    { id: '6', name: 'Emma Rousseau', avatar: '', isOnline: true, role: 'teacher', subject: 'Français', groupNumber: '4101' },
    { id: '7', name: 'Lucas Petit', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), role: 'student', class: '3e secondaire', groupNumber: '3101' },
    { id: '8', name: 'Alexandre Tremblay', avatar: '', isOnline: true, role: 'teacher', subject: 'Sciences', groupNumber: '5101' },
    { id: '9', name: 'Camille Gagnon', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 15), role: 'student', class: '5e secondaire', groupNumber: '5101' },
    { id: '10', name: 'Nicolas Bouchard', avatar: '', isOnline: true, role: 'student', class: '4e secondaire', groupNumber: '4102' },
    { id: '11', name: 'Isabelle Lavoie', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 4), role: 'teacher', subject: 'Histoire', groupNumber: '5101' },
    { id: '12', name: 'Gabriel Côté', avatar: '', isOnline: true, role: 'student', class: '3e secondaire', groupNumber: '3102' },
    { id: '13', name: 'Valérie Bergeron', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 45), role: 'student', class: '5e secondaire', groupNumber: '5102' },
    { id: '14', name: 'Marc-André Roy', avatar: '', isOnline: true, role: 'teacher', subject: 'Anglais', groupNumber: '4101' },
    { id: '15', name: 'Émilie Fortin', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 6), role: 'student', class: '4e secondaire', groupNumber: '4102' },
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
        id: '6',
        name: 'Lucas Petit',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[5]],
                lastMessage: {
            id: '6',
            content: 'Tu as fini le devoir de maths ?',
            senderId: '7',
            sender: mockUsers[5],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            status: 'read',
                    type: 'text'
                },
                unreadCount: 0,
                isPinned: false,
                isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
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
    },
    {
        id: '7',
        name: 'Alexandre Tremblay',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[6]],
        lastMessage: {
            id: '7',
            content: 'Le laboratoire est reporté à demain',
            senderId: '8',
            sender: mockUsers[6],
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: true,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 20),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        type: 'direct'
    },
    {
        id: '8',
        name: 'Camille Gagnon',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[7]],
        lastMessage: {
            id: '8',
            content: 'Tu peux m\'envoyer les notes du cours ?',
            senderId: '9',
            sender: mockUsers[7],
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 15),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        type: 'direct'
    },
    {
        id: '9',
        name: 'Nicolas Bouchard',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[8]],
        lastMessage: {
            id: '9',
            content: 'On se voit au café après les cours ?',
            senderId: '10',
            sender: mockUsers[8],
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            status: 'delivered',
            type: 'text'
        },
        unreadCount: 1,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
        type: 'direct'
    },
    {
        id: '10',
        name: 'Isabelle Lavoie',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[9]],
        lastMessage: {
            id: '10',
            content: 'L\'examen d\'histoire aura lieu la semaine prochaine',
            senderId: '11',
            sender: mockUsers[9],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: true,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        type: 'direct'
    },
    {
        id: '11',
        name: 'Gabriel Côté',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[10]],
        lastMessage: {
            id: '11',
            content: 'Merci pour l\'aide avec les devoirs !',
            senderId: '12',
            sender: mockUsers[10],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
        type: 'direct'
    },
    {
        id: '12',
        name: 'Valérie Bergeron',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[11]],
        lastMessage: {
            id: '12',
            content: 'Tu viens à la fête de fin d\'année ?',
            senderId: '13',
            sender: mockUsers[11],
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 45),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        type: 'direct'
    },
    {
        id: '13',
        name: 'Marc-André Roy',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[12]],
        lastMessage: {
            id: '13',
            content: 'Bon travail sur la présentation !',
            senderId: '14',
            sender: mockUsers[12],
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: true,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 10),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
        type: 'direct'
    },
    {
        id: '14',
        name: 'Émilie Fortin',
        avatar: '',
        isGroup: false,
        participants: [currentUser, mockUsers[13]],
        lastMessage: {
            id: '14',
            content: 'On se retrouve demain pour le projet ?',
            senderId: '15',
            sender: mockUsers[13],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
            status: 'read',
            type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        isMuted: false,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
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
    ],
    '7': [
        {
            id: '1',
            content: 'Bonjour ! J\'ai une question sur le laboratoire de demain',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: 'read',
            type: 'text'
        },
        {
            id: '2',
            content: 'Bonjour ! Bien sûr, quelle est votre question ?',
            senderId: '8',
            sender: mockUsers[6],
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            status: 'read',
            type: 'text'
        },
        {
            id: '3',
            content: 'Est-ce qu\'on doit apporter notre propre matériel ?',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            status: 'read',
            type: 'text'
        },
        {
            id: '4',
            content: 'Non, tout le matériel sera fourni. N\'oubliez pas votre cahier de laboratoire par contre !',
            senderId: '8',
            sender: mockUsers[6],
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: 'read',
            type: 'text'
        },
        {
            id: '5',
            content: 'Parfait, merci beaucoup !',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            status: 'read',
            type: 'text'
        },
        {
            id: '6',
            content: 'De rien ! À demain !',
            senderId: '8',
            sender: mockUsers[6],
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            status: 'read',
            type: 'text'
        }
    ],
    '13': [
        {
            id: '1',
            content: 'Bonjour M. Roy, j\'aimerais discuter de mon projet d\'anglais',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'read',
            type: 'text'
        },
        {
            id: '2',
            content: 'Bonjour ! Bien sûr, je suis disponible. De quoi souhaitez-vous discuter ?',
            senderId: '14',
            sender: mockUsers[12],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
            status: 'read',
            type: 'text'
        },
        {
            id: '3',
            content: 'Je voudrais savoir si je peux changer le sujet de mon projet',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
            status: 'read',
            type: 'text'
        },
        {
            id: '4',
            content: 'Absolument ! Quel nouveau sujet envisagez-vous ?',
            senderId: '14',
            sender: mockUsers[12],
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            status: 'read',
            type: 'text'
        },
        {
            id: '5',
            content: 'Je pensais à "L\'impact de la technologie sur l\'éducation"',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: 'read',
            type: 'text'
        },
        {
            id: '6',
            content: 'Excellente idée ! C\'est un sujet très pertinent. Envoyez-moi un plan détaillé d\'ici vendredi.',
            senderId: '14',
            sender: mockUsers[12],
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            status: 'read',
            type: 'text'
        },
        {
            id: '7',
            content: 'Parfait, je vais vous l\'envoyer. Merci !',
            senderId: '1',
            sender: currentUser,
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            status: 'read',
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
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Options pour le MultiSelect des utilisateurs
    const userOptions = mockUsers.map(user => ({
        value: user.id,
        label: `${user.groupNumber || '3101'} - ${user.name} (${user.role === 'student' ? 'Étudiant' : 'Professeur'})`
    }));

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
        if (newConversationType === 'group') {
            if (!newConversationName.trim() || selectedUsers.length === 0) return;
        } else {
            if (!selectedPerson) return;
        }

        let participants: User[] = [currentUser];
        let conversationName = '';

        if (newConversationType === 'group') {
            // Récupérer les utilisateurs sélectionnés pour le groupe
            const selectedUserObjects = selectedUsers.map(userId => 
                mockUsers.find(user => user.id === userId)
            ).filter(Boolean) as User[];
            participants = [currentUser, ...selectedUserObjects];
            conversationName = newConversationName;
        } else {
            // Récupérer la personne sélectionnée pour le message privé
            const selectedUser = mockUsers.find(user => user.id === selectedPerson);
            if (selectedUser) {
                participants = [currentUser, selectedUser];
                conversationName = selectedUser.name;
            }
        }

        const newConv: Conversation = {
            id: Date.now().toString(),
            name: conversationName,
            isGroup: newConversationType === 'group',
            participants: participants,
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
        setSelectedUsers([]);
        setSelectedPerson(null);
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
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [selectedConversation, messages]);

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="md">
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
                <Box style={{
                    height: 'calc(100vh - 200px)',
                    display: 'flex',
                            overflow: 'hidden'
                }}>
                    {/* Colonne 1: Liste des conversations */}
                    <Box style={{
                        width: '33.333%',
                        borderRight: '1px solid var(--mantine-color-gray-1)',
                        backgroundColor: 'transparent',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box p="lg" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Stack gap="xl" h="100%">
                                {/* Barre de recherche libre */}
                            <TextInput
                                placeholder="Rechercher..."
                                leftSection={<IconSearch size={16} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                size="sm"
                                    radius="md"
                                    variant="unstyled"
                                    styles={{
                                        input: {
                                            backgroundColor: 'var(--mantine-color-gray-0)',
                                            border: '1px solid var(--mantine-color-gray-2)',
                                            '&:focus': {
                                                borderColor: 'var(--mantine-color-violet-4)',
                                                boxShadow: '0 0 0 1px var(--mantine-color-violet-4)',
                                                backgroundColor: 'white'
                                            }
                                        }
                                    }}
                                />

                                {/* Onglets de filtrage libres */}
                                <Group gap="xs" justify="center" style={{ width: '100%' }}>
                                    <Button
                                        variant={activeTab === 'all' ? 'filled' : 'subtle'}
                                        color="violet"
                                        size="sm"
                                        radius="md"
                                        onClick={() => setActiveTab('all')}
                                        style={{ flex: 1, minWidth: 0 }}
                                    >
                                        Toutes
                                    </Button>
                                    <Button
                                        variant={activeTab === 'unread' ? 'filled' : 'subtle'}
                                        color="violet"
                                        size="sm"
                                        radius="md"
                                        onClick={() => setActiveTab('unread')}
                                        style={{ flex: 1, minWidth: 0 }}
                                    >
                                        Non lues
                                    </Button>
                                    <Button
                                        variant={activeTab === 'pinned' ? 'filled' : 'subtle'}
                                        color="violet"
                                        size="sm"
                                        radius="md"
                                        onClick={() => setActiveTab('pinned')}
                                        style={{ flex: 1, minWidth: 0 }}
                                    >
                                        Épinglées
                                    </Button>
                                </Group>

                                {/* Liste des conversations libre */}
                                <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                                    <Stack gap="xs">
                                        {sortedConversations.map((conv) => (
                                    <UnstyledButton
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                        style={{
                                                    padding: '16px 20px',
                                                    backgroundColor: selectedConversation?.id === conv.id ? 
                                                        'var(--mantine-color-violet-0)' : 'transparent',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                    border: selectedConversation?.id === conv.id ? 
                                                        '1px solid var(--mantine-color-violet-2)' : '1px solid transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                                    if (selectedConversation?.id !== conv.id) {
                                                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                                                        e.currentTarget.style.borderColor = 'var(--mantine-color-gray-2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                                    if (selectedConversation?.id !== conv.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <Group justify="space-between" align="flex-start">
                                                    <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
                                                    <Avatar
                                                            size="lg" 
                                                        radius="md"
                                                            src={conv.avatar}
                                                            style={{
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                            }}
                                                        >
                                                            {conv.name.charAt(0)}
                                                        </Avatar>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <Group justify="space-between" align="center" mb="xs">
                                                                <Text 
                                                                    fw={conv.unreadCount > 0 ? 600 : 500} 
                                                                    size="sm" 
                                                                    truncate
                                                                    c={conv.unreadCount > 0 ? 'dark' : 'gray.7'}
                                                                >
                                                                    {!conv.isGroup && conv.participants.find(p => p.id !== currentUser.id)?.groupNumber && 
                                                                     `${conv.participants.find(p => p.id !== currentUser.id)?.groupNumber} - `}
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
                                                            <Text 
                                                                size="sm" 
                                                                c="dimmed" 
                                                                lineClamp={1}
                                                                fw={conv.unreadCount > 0 ? 500 : 400}
                                                            >
                                                                {conv.lastMessage?.content || 'Aucun message'}
                                                    </Text>
                                                            {conv.isGroup && (
                                                                <Group gap="xs" mt="xs">
                                                                    <IconUsers size={12} color="var(--mantine-color-violet-5)" />
                                                                    <Text size="xs" c="violet.6" fw={500}>
                                                                        {conv.participants.length} membres
                                                                    </Text>
                                            </Group>
                                                            )}
                                                        </div>
                                                    </Group>
                                            <Group gap="xs">
                                                        {conv.unreadCount > 0 && (
                                                            <Badge 
                                                                size="sm" 
                                                                color="violet" 
                                                                variant="filled"
                                                                radius="md"
                                                                style={{ 
                                                                    fontWeight: 600,
                                                                    boxShadow: '0 2px 4px rgba(139, 69, 255, 0.3)'
                                                                }}
                                                            >
                                                                {conv.unreadCount}
                                                    </Badge>
                                                )}
                                                        <Menu shadow="md" width={200}>
                                                    <Menu.Target>
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="gray"
                                                                    size="sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ opacity: 0.6 }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.opacity = '1';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.opacity = '0.6';
                                                                    }}
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
                        </Box>
                    </Box>

                    {/* Colonne 2: Chat */}
                    <Box style={{
                            flex: 1,
                            display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {selectedConversation ? (
                            <Box style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'white',
                                overflow: 'hidden'
                            }}>
                                {/* En-tête du chat */}
                                <Box p="lg" style={{
                                    backgroundColor: 'white',
                                    borderBottom: '1px solid var(--mantine-color-gray-1)',
                                    flexShrink: 0,
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Group justify="space-between" align="center">
                                        <Group gap="md">
                                                <Avatar
                                                size="lg" 
                                                    radius="md"
                                                src={selectedConversation.avatar}
                                                style={{
                                                    border: '2px solid var(--mantine-color-violet-2)',
                                                    boxShadow: '0 2px 8px rgba(139, 69, 255, 0.15)'
                                                }}
                                            >
                                                {selectedConversation.name.charAt(0)}
                                                </Avatar>
                                            <div>
                                                <Text fw={700} size="md" c="dark">
                                                    {!selectedConversation.isGroup && selectedConversation.participants.find(p => p.id !== currentUser.id)?.groupNumber && 
                                                     `${selectedConversation.participants.find(p => p.id !== currentUser.id)?.groupNumber} - `}
                                                    {selectedConversation.name}
                                                </Text>
                                                <Group gap="xs" mt="xs">
                                                    {selectedConversation.isGroup ? (
                                                        <>
                                                            <IconUsers size={14} color="var(--mantine-color-violet-5)" />
                                                            <Text size="sm" c="violet.6" fw={500}>
                                                                {selectedConversation.participants.length} membres
                                                            </Text>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Group gap="xs">
                                                                <Box
                                                                    w={8}
                                                                    h={8}
                                                        style={{
                                                            borderRadius: '50%',
                                                                        backgroundColor: 'var(--mantine-color-green-5)',
                                                                        boxShadow: '0 0 0 2px var(--mantine-color-green-1)'
                                                                    }}
                                                                />
                                                                <Text size="sm" c="green.6" fw={500}>
                                                                    En ligne
                                                </Text>
                                                            </Group>
                                                            {/* Statut de l'utilisateur */}
                                                            {(() => {
                                                                const otherUser = selectedConversation.participants.find(p => p.id !== currentUser.id);
                                                                if (otherUser) {
                                                                    return (
                                                                        <Group gap="xs">
                                                                            {otherUser.role === 'student' ? (
                                                                                <>
                                                                                    <Box
                                                                                        w={6}
                                                                                        h={6}
                                                                                        style={{
                                                                                            borderRadius: '50%',
                                                                                            backgroundColor: 'var(--mantine-color-blue-5)',
                                                                                            boxShadow: '0 0 0 1px var(--mantine-color-blue-1)'
                                                                                        }}
                                                                                    />
                                                                                    <Text size="sm" c="blue.6" fw={500}>
                                                                                        Étudiant - {otherUser.class}
                                                </Text>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Box
                                                                                        w={6}
                                                                                        h={6}
                                                                                        style={{
                                                                                            borderRadius: '50%',
                                                                                            backgroundColor: 'var(--mantine-color-orange-5)',
                                                                                            boxShadow: '0 0 0 1px var(--mantine-color-orange-1)'
                                                                                        }}
                                                                                    />
                                                                                    <Text size="sm" c="orange.6" fw={500}>
                                                                                        Professeur {otherUser.subject}
                                                                                    </Text>
                                                                                </>
                                                                            )}
                                                                        </Group>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </>
                                                    )}
                                                </Group>
                                            </div>
                                        </Group>
                                        <Group gap="xs">
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="violet"
                                                size="md"
                                                radius="md"
                                                title="Appel vocal"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-violet-0)',
                                                    border: '1px solid var(--mantine-color-violet-2)'
                                                }}
                                            >
                                                <IconPhone size={18} />
                                            </ActionIcon>
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="violet"
                                                size="md"
                                                radius="md"
                                                onClick={handleStartVideoCall}
                                                title="Appel vidéo"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-violet-0)',
                                                    border: '1px solid var(--mantine-color-violet-2)'
                                                }}
                                            >
                                                <IconVideo size={18} />
                                            </ActionIcon>
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="gray"
                                                size="md"
                                                radius="md"
                                                title="Informations"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                                    border: '1px solid var(--mantine-color-gray-2)'
                                                }}
                                            >
                                                <IconInfoCircle size={18} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Box>

                                {/* Zone des messages avec hauteur fixe */}
                                <Box style={{
                                        flex: 1,
                                    overflow: 'auto',
                                    minHeight: 0,
                                    backgroundColor: 'var(--mantine-color-gray-0)'
                                }} ref={messagesEndRef}>
                                    <Box p="lg">
                                        <Stack gap="md">
                                                {(messages[selectedConversation.id] || []).map((message, index) => {
                                                const isCurrentUser = message.senderId === currentUser.id;
                                                const prevMessage = index > 0 ? messages[selectedConversation.id][index - 1] : null;
                                                const isConsecutive = prevMessage && prevMessage.senderId === message.senderId;
                                                const timeDiff = prevMessage ? 
                                                    message.timestamp.getTime() - prevMessage.timestamp.getTime() : 
                                                    Infinity;
                                                const showAvatar = !isConsecutive || timeDiff > 5 * 60 * 1000; // 5 minutes
                                                
                                                return (
                                                    <Box key={message.id}>
                                                        {/* Séparateur de date si nécessaire */}
                                                        {index === 0 || 
                                                         (prevMessage && 
                                                          message.timestamp.toDateString() !== prevMessage.timestamp.toDateString()) && (
                                                            <Center my="md">
                                                                <Text 
                                                                    size="xs" 
                                                                    c="dimmed" 
                                                                    fw={600}
                                                                    style={{
                                                                        backgroundColor: 'var(--mantine-color-gray-1)',
                                                                        padding: '4px 12px',
                                                                        borderRadius: '12px',
                                                                        border: '1px solid var(--mantine-color-gray-2)'
                                                                    }}
                                                                >
                                                                    {message.timestamp.toLocaleDateString('fr-FR', { 
                                                                        weekday: 'long', 
                                                                        day: 'numeric', 
                                                                        month: 'long' 
                                                                    })}
                                                                </Text>
                                                            </Center>
                                                        )}
                                                        
                                            <Group
                                                            justify={isCurrentUser ? 'flex-end' : 'flex-start'}
                                                align="flex-start"
                                                gap="sm"
                                                            mb={isConsecutive ? 2 : 8}
                                            >
                                                            {!isCurrentUser && (
                                                                <Box style={{ minWidth: 32 }}>
                                                                    {showAvatar ? (
                                                    <Avatar
                                                        size="sm"
                                                        radius="md"
                                                                            src={message.sender.avatar}
                                                                            style={{
                                                                                border: '2px solid var(--mantine-color-violet-1)',
                                                                                boxShadow: '0 2px 4px rgba(139, 69, 255, 0.15)',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 69, 255, 0.25)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.transform = 'scale(1)';
                                                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 69, 255, 0.15)';
                                                                            }}
                                                                        >
                                                                            {message.sender.name.charAt(0)}
                                                                        </Avatar>
                                                                    ) : (
                                                                        <Box w={32} />
                                                                    )}
                                                                </Box>
                                                            )}
                                                            
                                                            <Box style={{ maxWidth: '70%', minWidth: '120px' }}>
                                                                {/* Nom de l'expéditeur pour les messages de groupe */}
                                                                {!isCurrentUser && showAvatar && selectedConversation.isGroup && (
                                                                    <Text 
                                                                        size="xs" 
                                                                        c="violet.6" 
                                                                        fw={600} 
                                                                        mb="xs"
                                                                        style={{ marginLeft: '4px' }}
                                                                    >
                                                                        {message.sender.name}
                                                                    </Text>
                                                                )}
                                                                
                                                <Box
                                                    style={{
                                                                        backgroundColor: isCurrentUser ? 
                                                                            'var(--mantine-color-violet-6)' : 
                                                                            'white',
                                                                        color: isCurrentUser ? 
                                                                            'white' : 'var(--mantine-color-gray-8)',
                                                        padding: '12px 16px',
                                                                        borderRadius: '18px',
                                                                        borderBottomRightRadius: isCurrentUser ? '6px' : '18px',
                                                                        borderBottomLeftRadius: isCurrentUser ? '18px' : '6px',
                                                                        border: isCurrentUser ? 'none' : '1px solid var(--mantine-color-gray-2)',
                                                                        boxShadow: isCurrentUser ? 
                                                                            '0 2px 8px rgba(139, 69, 255, 0.25)' : 
                                                                            '0 1px 3px rgba(0, 0, 0, 0.08)',
                                                                        transition: 'all 0.2s ease',
                                                                        position: 'relative',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                                        e.currentTarget.style.boxShadow = isCurrentUser ? 
                                                                            '0 4px 12px rgba(139, 69, 255, 0.35)' : 
                                                                            '0 2px 6px rgba(0, 0, 0, 0.12)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.transform = 'none';
                                                                        e.currentTarget.style.boxShadow = isCurrentUser ? 
                                                                            '0 2px 8px rgba(139, 69, 255, 0.25)' : 
                                                                            '0 1px 3px rgba(0, 0, 0, 0.08)';
                                                                    }}
                                                                >
                                                                    {/* Effet de gradient subtil */}
                                                                    {isCurrentUser && (
                                                                        <Box
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                height: '1px',
                                                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                                                                            }}
                                                                        />
                                                                    )}
                                                                    
                                                                    <Text 
                                                                        size="sm" 
                                                                        style={{ 
                                                                            wordBreak: 'break-word', 
                                                                            lineHeight: 1.5,
                                                                            position: 'relative',
                                                                            zIndex: 1
                                                                        }}
                                                                    >
                                                        {message.content}
                                                    </Text>
                                                                    
                                                                    <Group 
                                                                        justify="space-between" 
                                                                        align="center" 
                                                                        mt="xs"
                                                                        style={{ position: 'relative', zIndex: 1 }}
                                                                    >
                                                                        <Text 
                                                                            size="xs" 
                                                                            c={isCurrentUser ? 'rgba(255,255,255,0.7)' : 'dimmed'}
                                                                            fw={500}
                                                                        >
                                                            {formatMessageTime(message.timestamp)}
                                                        </Text>
                                                                        
                                                                        {isCurrentUser && (
                                                            <Group gap="xs">
                                                                                {message.status === 'sending' && (
                                                                                    <Loader size="xs" color="rgba(255,255,255,0.8)" />
                                                                                )}
                                                                                {message.status === 'sent' && (
                                                                                    <IconCheck 
                                                                                        size={12} 
                                                                                        color="rgba(255,255,255,0.8)"
                                                                                        style={{ opacity: 0.8 }}
                                                                                    />
                                                                                )}
                                                                                {message.status === 'delivered' && (
                                                                                    <IconChecks 
                                                                                        size={12} 
                                                                                        color="rgba(255,255,255,0.8)"
                                                                                        style={{ opacity: 0.8 }}
                                                                                    />
                                                                                )}
                                                                                {message.status === 'read' && (
                                                                                    <IconChecks 
                                                                                        size={12} 
                                                                                        color="var(--mantine-color-yellow-3)"
                                                                                        style={{ 
                                                                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                                                                                        }}
                                                                                    />
                                                                )}
                                                            </Group>
                                                        )}
                                                    </Group>
                                                </Box>
                                                            </Box>
                                            </Group>
                                                    </Box>
                                                );
                                            })}
                                            <div />
                                    </Stack>
                                    </Box>
                                </Box>

                                {/* Zone de saisie */}
                                <Box p="lg" style={{
                                    backgroundColor: 'white',
                                    borderTop: '1px solid var(--mantine-color-gray-1)',
                                    flexShrink: 0,
                                    boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                        <Group gap="sm" align="flex-end">
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="gray"
                                                size="md"
                                                radius="md"
                                                title="Joindre un fichier"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                                    border: '1px solid var(--mantine-color-gray-2)'
                                                }}
                                            >
                                                <IconPaperclip size={18} />
                                        </ActionIcon>
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="gray"
                                                size="md"
                                                radius="md"
                                                title="Envoyer une photo"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                                    border: '1px solid var(--mantine-color-gray-2)'
                                                }}
                                            >
                                                <IconPhoto size={18} />
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
                                                styles={{
                                                    input: {
                                                        backgroundColor: 'white',
                                                        border: '1px solid var(--mantine-color-gray-3)',
                                                        '&:focus': {
                                                            borderColor: 'var(--mantine-color-violet-4)',
                                                            boxShadow: '0 0 0 1px var(--mantine-color-violet-4)'
                                                        }
                                                    }
                                                }}
                                            />
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="gray"
                                                size="md"
                                                radius="md"
                                                title="Ajouter un emoji"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                                    border: '1px solid var(--mantine-color-gray-2)'
                                                }}
                                            >
                                                <IconMoodSmile size={18} />
                                            </ActionIcon>
                                        <ActionIcon
                                            variant="filled"
                                            color="violet"
                                                size="md"
                                            radius="md"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                                title="Envoyer le message"
                                                style={{
                                                    backgroundColor: 'var(--mantine-color-violet-6)',
                                                    border: '1px solid var(--mantine-color-violet-6)',
                                                    boxShadow: '0 2px 8px rgba(139, 69, 255, 0.3)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (newMessage.trim()) {
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 69, 255, 0.4)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'none';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 69, 255, 0.3)';
                                                }}
                                            >
                                                <IconSend size={18} />
                                        </ActionIcon>
                                    </Group>
                                </Box>
                            </Box>
                        ) : (
                                <Card withBorder={false} p="xl" radius="md" style={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                    border: '2px dashed var(--mantine-color-gray-3)'
                                }}>
                                    <ThemeIcon 
                                        size={80} 
                                        radius="md" 
                                        color="violet" 
                                        variant="light"
                                        style={{
                                            boxShadow: '0 4px 12px rgba(139, 69, 255, 0.15)'
                                        }}
                                    >
                                        <IconMessage size={40} />
                                    </ThemeIcon>
                                    <Text fw={700} size="xl" c="dark" mt="lg" ta="center">
                                        Sélectionnez une conversation
                                    </Text>
                                    <Text c="dimmed" size="md" ta="center" mt="sm" maw={400}>
                                        Choisissez une conversation dans la liste pour commencer à discuter avec vos collègues et amis
                                    </Text>
                                    <Button
                                        variant="light"
                                        color="violet"
                                        size="md"
                                        radius="md"
                                        leftSection={<IconPlus size={16} />}
                                        onClick={() => setModalOpened(true)}
                                        mt="lg"
                                    >
                                        Nouvelle conversation
                                    </Button>
                                </Card>
                        )}
                    </Box>
                </Box>

                {/* Modal de nouvelle conversation */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={
                        <Group gap="sm">
                            <ThemeIcon size="sm" radius="md" color="violet" variant="light">
                                <IconPlus size={16} />
                            </ThemeIcon>
                            <Text fw={600}>Nouvelle conversation</Text>
                        </Group>
                    }
                    size="md"
                    radius="md"
                    styles={{
                        header: {
                            borderBottom: '1px solid var(--mantine-color-gray-2)',
                            paddingBottom: 'var(--mantine-spacing-md)'
                        }
                    }}
                >
                    <Stack gap="lg">
                        {/* Type de conversation - EN PREMIER */}
                        <Group gap="xs">
                            <Button
                                variant={newConversationType === 'direct' ? 'filled' : 'light'}
                                color="violet"
                                size="md"
                                radius="md"
                                leftSection={<IconUser size={16} />}
                                onClick={() => setNewConversationType('direct')}
                                style={{ flex: 1 }}
                            >
                                Message privé
                            </Button>
                            <Button
                                variant={newConversationType === 'group' ? 'filled' : 'light'}
                                color="violet"
                                size="md"
                                radius="md"
                                leftSection={<IconUsers size={16} />}
                                onClick={() => setNewConversationType('group')}
                                style={{ flex: 1 }}
                            >
                                Groupe
                            </Button>
                        </Group>

                        {/* Champ de nom - CONDITIONNEL */}
                        {newConversationType === 'group' ? (
                        <TextInput
                                label="Nom du groupe"
                                placeholder="Entrez le nom du groupe"
                            value={newConversationName}
                            onChange={(e) => setNewConversationName(e.target.value)}
                            required
                            radius="md"
                                styles={{
                                    input: {
                                        '&:focus': {
                                            borderColor: 'var(--mantine-color-violet-4)',
                                            boxShadow: '0 0 0 1px var(--mantine-color-violet-4)'
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Select
                                label="Sélectionner une personne"
                                placeholder="Rechercher une personne..."
                                data={userOptions}
                                value={selectedPerson}
                                onChange={setSelectedPerson}
                                searchable
                                clearable
                                required
                                radius="md"
                                styles={{
                                    input: {
                                        '&:focus': {
                                            borderColor: 'var(--mantine-color-violet-4)',
                                            boxShadow: '0 0 0 1px var(--mantine-color-violet-4)'
                                        }
                                    }
                                }}
                            />
                        )}

                        {/* Sélection des utilisateurs - SEULEMENT POUR LES GROUPES */}
                        {newConversationType === 'group' && (
                            <MultiSelect
                                label="Membres du groupe"
                                placeholder="Sélectionnez les utilisateurs à ajouter"
                                data={userOptions}
                                value={selectedUsers}
                                onChange={setSelectedUsers}
                                searchable
                                clearable
                                required
                                radius="md"
                                styles={{
                                    input: {
                                        '&:focus': {
                                            borderColor: 'var(--mantine-color-violet-4)',
                                            boxShadow: '0 0 0 1px var(--mantine-color-violet-4)'
                                        }
                                    }
                                }}
                            />
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button 
                                variant="light" 
                                onClick={() => setModalOpened(false)}
                                radius="md"
                            >
                                Annuler
                            </Button>
                            <Button 
                                onClick={handleCreateConversation} 
                                color="violet"
                                radius="md"
                                disabled={
                                    (newConversationType === 'group' && (!newConversationName.trim() || selectedUsers.length === 0)) ||
                                    (newConversationType === 'direct' && !selectedPerson)
                                }
                                style={{
                                    boxShadow: '0 2px 8px rgba(139, 69, 255, 0.3)'
                                }}
                            >
                                Créer la conversation
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
        </MainLayout>
    );
};

export default MessagingPage;