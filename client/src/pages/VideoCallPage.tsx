import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Title,
    Stack,
    Text,
    Group,
    Badge,
    Button,
    ThemeIcon,
    Center,
    Loader,
    Avatar,
    ActionIcon,
    Divider,
    Flex,
    Grid,
    TextInput,
    Overlay,
    Card,
    ScrollArea,
} from '@mantine/core';
import {
    IconPhoneOff,
    IconMicrophone,
    IconMicrophoneOff,
    IconVideo,
    IconVideoOff,
    IconScreenShare,
    IconScreenShareOff,
    IconSettings,
    IconUsers,
    IconMessageCircle,
    IconSend,
    IconVolumeOff,
    IconChevronDown,
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

// Types pour les données placeholder
interface CallParticipant {
    id: string;
    name: string;
    avatar: string;
    isVideoOn: boolean;
    isAudioOn: boolean;
    isScreenSharing: boolean;
    isHost: boolean;
    isMuted: boolean;
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
    role: 'host' | 'participant' | 'presenter';
}

interface CallInfo {
    id: string;
    title: string;
    description: string;
    startTime: string;
    duration: number;
    participants: CallParticipant[];
    isRecording: boolean;
    isScreenSharing: boolean;
    isMuted: boolean;
    isVideoOn: boolean;
    maxParticipants: number;
    meetingId: string;
    passcode?: string;
}

interface ChatMessage {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    timestamp: string;
    type: 'message' | 'system' | 'file';
    isOwn: boolean;
}

// Données placeholder
const mockCallInfo: CallInfo = {
    id: '1',
    title: 'Réunion de projet - Application mobile',
    description: 'Discussion sur l\'avancement du projet et planification des prochaines étapes',
    startTime: '2024-01-25T14:00:00',
    duration: 45,
    participants: [
        {
            id: '1',
            name: 'Marie Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            isVideoOn: true,
            isAudioOn: true,
            isScreenSharing: false,
            isHost: true,
            isMuted: false,
            connectionStatus: 'connected',
            role: 'host'
        },
        {
            id: '2',
            name: 'Pierre Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            isVideoOn: true,
            isAudioOn: true,
            isScreenSharing: false,
            isHost: false,
            isMuted: false,
            connectionStatus: 'connected',
            role: 'participant'
        },
        {
            id: '3',
            name: 'Sophie Moreau',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            isVideoOn: false,
            isAudioOn: true,
            isScreenSharing: false,
            isHost: false,
            isMuted: false,
            connectionStatus: 'connected',
            role: 'participant'
        },
        {
            id: '4',
            name: 'Lucas Rousseau',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            isVideoOn: true,
            isAudioOn: false,
            isScreenSharing: true,
            isHost: false,
            isMuted: true,
            connectionStatus: 'connected',
            role: 'presenter'
        }
    ],
    isRecording: false,
    isScreenSharing: true,
    isMuted: false,
    isVideoOn: true,
    maxParticipants: 8,
    meetingId: 'ABC-123-DEF',
    passcode: '123456'
};

const mockChatMessages: ChatMessage[] = [
    {
        id: '1',
        author: {
            name: 'Marie Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        content: 'Salut tout le monde ! Comment ça va ?',
        timestamp: '2024-01-25T14:05:00',
        type: 'message',
        isOwn: false
    },
    {
        id: '2',
        author: {
            name: 'Pierre Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        content: 'Ça va bien ! J\'ai terminé la partie backend hier soir',
        timestamp: '2024-01-25T14:06:00',
        type: 'message',
        isOwn: true
    },
    {
        id: '3',
        author: {
            name: 'Système',
            avatar: ''
        },
        content: 'Lucas Rousseau a commencé le partage d\'écran',
        timestamp: '2024-01-25T14:07:00',
        type: 'system',
        isOwn: false
    },
    {
        id: '4',
        author: {
            name: 'Sophie Moreau',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        content: 'Parfait ! Je peux voir l\'écran maintenant',
        timestamp: '2024-01-25T14:08:00',
        type: 'message',
        isOwn: false
    }
];

const VideoCallPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [callInfo, setCallInfo] = useState<CallInfo>(mockCallInfo);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(true);
    const [showParticipants, setShowParticipants] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLeaving, setIsLeaving] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(prev => prev + 1);
        }, 1000);

        // Désactiver le scroll de la page
        document.body.style.overflow = 'hidden';

        return () => {
            clearInterval(timer);
            // Réactiver le scroll quand on quitte la page
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

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

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleVideo = () => {
        setCallInfo(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
    };

    const handleToggleAudio = () => {
        setCallInfo(prev => ({ ...prev, isMuted: !prev.isMuted }));
    };

    const handleToggleScreenShare = () => {
        setCallInfo(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
    };

    const handleLeaveCall = () => {
        setIsLeaving(true);
        setTimeout(() => {
            window.history.back();
        }, 1000);
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message: ChatMessage = {
                id: Date.now().toString(),
                author: {
                    name: user?.name || 'Vous',
                    avatar: ''
                },
                content: newMessage.trim(),
                timestamp: new Date().toISOString(),
                type: 'message',
                isOwn: true
            };
            setChatMessages(prev => [...prev, message]);
            setNewMessage('');
        }
    };

    const getParticipantGridCols = (count: number) => {
        if (count <= 1) return 12;
        if (count <= 2) return 6;
        if (count <= 4) return 4;
        if (count <= 6) return 3;
        return 2;
    };

    const getParticipantCardHeight = (count: number) => {
        const availableHeight = 'calc(100vh - 260px)';
        if (count <= 1) return availableHeight;
        if (count <= 2) return `calc(${availableHeight} / 1)`;
        if (count <= 4) return `calc(${availableHeight} / 2)`;
        if (count <= 6) return `calc(${availableHeight} / 2)`;
        return `calc(${availableHeight} / 3)`;
    };

    const currentUser = callInfo.participants.find(p => p.id === user?.id) || callInfo.participants[0];

    return (
        <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
            <Box style={{
                height: 'calc(100vh - 60px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}>
                {/* En-tête moderne et épuré */}
                <Box
                    p="lg"
                    style={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid var(--mantine-color-gray-1)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <Group justify="space-between" align="center">
                        <Group gap="lg">
                            <div>
                                <Title order={3} size="h4" mb="xs" c="dark">
                                    {callInfo.title}
                                </Title>
                                <Group gap="md">
                                    <Group gap="xs">
                                        <ThemeIcon size="sm" color="green" variant="light" radius="md">
                                            <IconVideo size={12} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed" fw={500}>
                                            {formatTime(currentTime)}
                                        </Text>
                                    </Group>
                                    <Group gap="xs">
                                        <ThemeIcon size="sm" color="blue" variant="light" radius="md">
                                            <IconUsers size={12} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed" fw={500}>
                                            {callInfo.participants.length} participant{callInfo.participants.length > 1 ? 's' : ''}
                                        </Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Text size="sm" c="dimmed" fw={500}>
                                            ID: {callInfo.meetingId}
                                        </Text>
                                    </Group>
                                </Group>
                            </div>
                        </Group>

                        <Group gap="sm">
                            <Badge
                                color="green"
                                variant="light"
                                size="md"
                                radius="md"
                                style={{ fontWeight: 600 }}
                            >
                                En cours
                            </Badge>
                            {callInfo.isRecording && (
                                <Badge
                                    color="red"
                                    variant="filled"
                                    size="md"
                                    radius="md"
                                    style={{ fontWeight: 600 }}
                                >
                                    Enregistrement
                                </Badge>
                            )}
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="md"
                                radius="md"
                                style={{
                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                    border: '1px solid var(--mantine-color-gray-2)'
                                }}
                            >
                                <IconSettings size={16} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Box>

                {/* Zone principale avec layout optimisé */}
                <Flex style={{ flex: 1, minHeight: 0, height: '100%' }}>
                    {/* Zone vidéo principale */}
                    <Box style={{ flex: 1, position: 'relative', minWidth: 0, height: '100%' }}>
                        {callInfo.isScreenSharing ? (
                            <Box style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                                {/* Écran partagé avec overlay d'informations */}
                                <Box
                                    style={{
                                        height: '100%',
                                        backgroundColor: '#1a1a1a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Stack align="center" gap="md">
                                        <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                                            <IconScreenShare size={32} />
                                        </ThemeIcon>
                                        <Text size="lg" c="white" ta="center">
                                            Écran partagé par {callInfo.participants.find(p => p.isScreenSharing)?.name}
                                        </Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            Cliquez sur "Arrêter le partage" pour reprendre la vue normale
                                        </Text>
                                    </Stack>

                                    <Badge
                                        color="red"
                                        variant="filled"
                                        size="lg"
                                        style={{ position: 'absolute', top: 16, right: 16 }}
                                    >
                                        PARTAGE D'ÉCRAN
                                    </Badge>
                                </Box>

                                {/* Vue en miniature des participants */}
                                <Box
                                    style={{
                                        position: 'absolute',
                                        bottom: 20,
                                        right: 20,
                                        width: 180,
                                        height: 120,
                                        backgroundColor: '#2a2a2a',
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        border: '2px solid var(--mantine-color-blue-6)'
                                    }}
                                >
                                    <Box
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#3a3a3a'
                                        }}
                                    >
                                        <Avatar
                                            src={currentUser?.avatar}
                                            size="md"
                                            radius="xl"
                                        />
                                        <Text size="xs" c="white" mt="xs" ta="center">
                                            {currentUser?.name}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box style={{ height: '100%', padding: 20, backgroundColor: 'var(--mantine-color-gray-0)', overflow: 'auto' }}>
                                <Grid style={{ height: '100%', margin: 0 }} gutter="lg">
                                    {callInfo.participants.map((participant) => (
                                        <Grid.Col
                                            key={participant.id}
                                            span={getParticipantGridCols(callInfo.participants.length)}
                                            style={{ height: getParticipantCardHeight(callInfo.participants.length) }}
                                        >
                                            <Card
                                                p={0}
                                                radius="lg"
                                                style={{
                                                    height: '100%',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    backgroundColor: 'white',
                                                    border: '2px solid var(--mantine-color-gray-2)',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-violet-4)';
                                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 69, 255, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-gray-2)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                                }}
                                            >
                                                {participant.isVideoOn ? (
                                                    <Box
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: 'var(--mantine-color-gray-8)',
                                                            background: 'linear-gradient(135deg, var(--mantine-color-violet-6) 0%, var(--mantine-color-blue-6) 100%)'
                                                        }}
                                                    >
                                                        <Text size="lg" c="white" fw={600}>
                                                            {participant.name}
                                                        </Text>
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: 'var(--mantine-color-gray-1)',
                                                            padding: 24
                                                        }}
                                                    >
                                                        <Avatar
                                                            src={participant.avatar}
                                                            size="xl"
                                                            radius="xl"
                                                            style={{
                                                                border: '3px solid white',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                                            }}
                                                        />
                                                        <Text size="md" c="dark" mt="md" ta="center" fw={600}>
                                                            {participant.name}
                                                        </Text>
                                                        <Text size="sm" c="dimmed" ta="center" mt="xs">
                                                            {participant.role === 'host' ? 'Organisateur' :
                                                                participant.role === 'presenter' ? 'Présentateur' : 'Participant'}
                                                        </Text>
                                                    </Box>
                                                )}

                                                {/* Indicateurs de statut en overlay */}
                                                <Box
                                                    style={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        left: 12,
                                                        right: 12,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start'
                                                    }}
                                                >
                                                    <Group gap="xs">
                                                        {participant.isHost && (
                                                            <Badge
                                                                color="blue"
                                                                variant="filled"
                                                                size="sm"
                                                                radius="md"
                                                                style={{ fontWeight: 600 }}
                                                            >
                                                                Organisateur
                                                            </Badge>
                                                        )}
                                                        {participant.role === 'presenter' && (
                                                            <Badge
                                                                color="green"
                                                                variant="filled"
                                                                size="sm"
                                                                radius="md"
                                                                style={{ fontWeight: 600 }}
                                                            >
                                                                Présentateur
                                                            </Badge>
                                                        )}
                                                    </Group>

                                                    <Group gap="xs">
                                                        {!participant.isAudioOn && (
                                                            <ThemeIcon
                                                                size="md"
                                                                color="red"
                                                                radius="xl"
                                                                variant="filled"
                                                                style={{ boxShadow: '0 2px 8px rgba(255, 0, 0, 0.3)' }}
                                                            >
                                                                <IconMicrophoneOff size={14} />
                                                            </ThemeIcon>
                                                        )}
                                                        {participant.isMuted && (
                                                            <ThemeIcon
                                                                size="md"
                                                                color="red"
                                                                radius="xl"
                                                                variant="filled"
                                                                style={{ boxShadow: '0 2px 8px rgba(255, 0, 0, 0.3)' }}
                                                            >
                                                                <IconVolumeOff size={14} />
                                                            </ThemeIcon>
                                                        )}
                                                    </Group>
                                                </Box>
                                            </Card>
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>

                    {/* Panneau latéral moderne */}
                    {showChat && (
                        <Box
                            style={{
                                width: 360,
                                height: '100%',
                                borderLeft: '1px solid var(--mantine-color-gray-1)',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'white',
                                boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.05)',
                                flexShrink: 0
                            }}
                        >
                            <Box
                                p="md"
                                style={{
                                    borderBottom: '1px solid var(--mantine-color-gray-1)',
                                    backgroundColor: 'var(--mantine-color-gray-0)'
                                }}
                            >
                                <Group justify="space-between" align="center">
                                    <Group gap="xs">
                                        <Button
                                            variant={!showParticipants ? "filled" : "subtle"}
                                            color="violet"
                                            size="sm"
                                            radius="md"
                                            leftSection={<IconMessageCircle size={16} />}
                                            onClick={() => setShowParticipants(false)}
                                            style={{ fontWeight: 600 }}
                                        >
                                            Chat
                                        </Button>
                                        <Button
                                            variant={showParticipants ? "filled" : "subtle"}
                                            color="violet"
                                            size="sm"
                                            radius="md"
                                            leftSection={<IconUsers size={16} />}
                                            onClick={() => setShowParticipants(true)}
                                            style={{ fontWeight: 600 }}
                                        >
                                            Participants ({callInfo.participants.length})
                                        </Button>
                                    </Group>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        size="sm"
                                        onClick={() => setShowChat(false)}
                                    >
                                        <IconChevronDown size={16} />
                                    </ActionIcon>
                                </Group>
                            </Box>

                            {/* Section Chat */}
                            {!showParticipants && (
                                <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                    <ScrollArea style={{ flex: 1, minHeight: 0 }} p="md">
                                        <Stack gap="md">
                                            {chatMessages.map((message) => (
                                                <Box
                                                    key={message.id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: message.isOwn ? 'flex-end' : 'flex-start'
                                                    }}
                                                >
                                                    <Box
                                                        style={{
                                                            maxWidth: '85%',
                                                            backgroundColor: message.isOwn ? 'var(--mantine-color-violet-6)' : 'var(--mantine-color-gray-1)',
                                                            color: message.isOwn ? 'white' : 'var(--mantine-color-gray-8)',
                                                            padding: '12px 16px',
                                                            borderRadius: '18px',
                                                            fontSize: 14,
                                                            border: message.isOwn ? 'none' : '1px solid var(--mantine-color-gray-2)',
                                                            boxShadow: message.isOwn ? '0 2px 8px rgba(139, 69, 255, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    >
                                                        {!message.isOwn && message.type === 'message' && (
                                                            <Text size="xs" c="dimmed" mb={4} fw={600}>
                                                                {message.author.name}
                                                            </Text>
                                                        )}
                                                        <Text size="sm" style={{ lineHeight: 1.4 }}>
                                                            {message.content}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" mt={4} style={{ opacity: 0.7 }}>
                                                            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </Text>
                                                    </Box>
                                                </Box>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </Stack>
                                    </ScrollArea>

                                    <Box
                                        p="md"
                                        style={{
                                            borderTop: '1px solid var(--mantine-color-gray-1)',
                                            backgroundColor: 'var(--mantine-color-gray-0)'
                                        }}
                                    >
                                        <Group gap="sm">
                                            <TextInput
                                                placeholder="Tapez un message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                style={{ flex: 1 }}
                                                size="md"
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
                                            <ActionIcon
                                                size="md"
                                                radius="md"
                                                color="violet"
                                                variant="filled"
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                                style={{
                                                    boxShadow: '0 2px 8px rgba(139, 69, 255, 0.3)'
                                                }}
                                            >
                                                <IconSend size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Box>
                                </Box>
                            )}

                            {/* Section Participants */}
                            {showParticipants && (
                                <ScrollArea style={{ flex: 1, minHeight: 0 }} p="md">
                                    <Stack gap="sm">
                                        {callInfo.participants.map((participant) => (
                                            <Card
                                                key={participant.id}
                                                p="md"
                                                radius="md"
                                                style={{
                                                    border: '1px solid var(--mantine-color-gray-2)',
                                                    backgroundColor: 'white',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-violet-3)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 69, 255, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-gray-2)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Group justify="space-between" align="center">
                                                    <Group gap="md">
                                                        <Avatar
                                                            src={participant.avatar}
                                                            size="md"
                                                            radius="xl"
                                                            style={{
                                                                border: '2px solid var(--mantine-color-gray-1)',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                            }}
                                                        />
                                                        <div>
                                                            <Text size="sm" fw={600} c="dark">
                                                                {participant.name}
                                                            </Text>
                                                            <Text size="xs" c="dimmed" mt={2}>
                                                                {participant.role === 'host' ? 'Organisateur' :
                                                                    participant.role === 'presenter' ? 'Présentateur' : 'Participant'}
                                                            </Text>
                                                        </div>
                                                    </Group>

                                                    <Group gap="xs">
                                                        {participant.isVideoOn ? (
                                                            <ThemeIcon size="sm" color="green" radius="xl" variant="light">
                                                                <IconVideo size={12} />
                                                            </ThemeIcon>
                                                        ) : (
                                                            <ThemeIcon size="sm" color="red" radius="xl" variant="light">
                                                                <IconVideoOff size={12} />
                                                            </ThemeIcon>
                                                        )}
                                                        {participant.isAudioOn ? (
                                                            <ThemeIcon size="sm" color="green" radius="xl" variant="light">
                                                                <IconMicrophone size={12} />
                                                            </ThemeIcon>
                                                        ) : (
                                                            <ThemeIcon size="sm" color="red" radius="xl" variant="light">
                                                                <IconMicrophoneOff size={12} />
                                                            </ThemeIcon>
                                                        )}
                                                    </Group>
                                                </Group>
                                            </Card>
                                        ))}
                                    </Stack>
                                </ScrollArea>
                            )}
                        </Box>
                    )}
                </Flex>

                {/* Contrôles modernes en bas */}
                <Box
                    p="lg"
                    style={{
                        backgroundColor: 'white',
                        borderTop: '1px solid var(--mantine-color-gray-1)',
                        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <Group justify="center" gap="lg">
                        {/* Contrôles audio/vidéo */}
                        <Group gap="sm">
                            <ActionIcon
                                size="xl"
                                radius="xl"
                                color={callInfo.isMuted ? "red" : "gray"}
                                variant={callInfo.isMuted ? "filled" : "light"}
                                onClick={handleToggleAudio}
                                style={{
                                    backgroundColor: callInfo.isMuted ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-1)',
                                    border: callInfo.isMuted ? 'none' : '1px solid var(--mantine-color-gray-3)',
                                    boxShadow: callInfo.isMuted ? '0 4px 12px rgba(255, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                {callInfo.isMuted ? <IconMicrophoneOff size={22} /> : <IconMicrophone size={22} />}
                            </ActionIcon>

                            <ActionIcon
                                size="xl"
                                radius="xl"
                                color={callInfo.isVideoOn ? "blue" : "red"}
                                variant={callInfo.isVideoOn ? "filled" : "light"}
                                onClick={handleToggleVideo}
                                style={{
                                    backgroundColor: callInfo.isVideoOn ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-red-6)',
                                    border: 'none',
                                    boxShadow: callInfo.isVideoOn ? '0 4px 12px rgba(0, 123, 255, 0.3)' : '0 4px 12px rgba(255, 0, 0, 0.3)'
                                }}
                            >
                                {callInfo.isVideoOn ? <IconVideo size={22} /> : <IconVideoOff size={22} />}
                            </ActionIcon>

                            <ActionIcon
                                size="xl"
                                radius="xl"
                                color={callInfo.isScreenSharing ? "green" : "gray"}
                                variant={callInfo.isScreenSharing ? "filled" : "light"}
                                onClick={handleToggleScreenShare}
                                style={{
                                    backgroundColor: callInfo.isScreenSharing ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-gray-1)',
                                    border: callInfo.isScreenSharing ? 'none' : '1px solid var(--mantine-color-gray-3)',
                                    boxShadow: callInfo.isScreenSharing ? '0 4px 12px rgba(0, 200, 83, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                {callInfo.isScreenSharing ? <IconScreenShareOff size={22} /> : <IconScreenShare size={22} />}
                            </ActionIcon>
                        </Group>

                        <Divider orientation="vertical" size="sm" />

                        {/* Contrôles d'interface */}
                        <Group gap="sm">
                            <ActionIcon
                                size="lg"
                                radius="xl"
                                color={showChat ? "violet" : "gray"}
                                variant={showChat ? "filled" : "light"}
                                onClick={() => setShowChat(!showChat)}
                                style={{
                                    backgroundColor: showChat ? 'var(--mantine-color-violet-6)' : 'var(--mantine-color-gray-1)',
                                    border: showChat ? 'none' : '1px solid var(--mantine-color-gray-3)',
                                    boxShadow: showChat ? '0 2px 8px rgba(139, 69, 255, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <IconMessageCircle size={18} />
                            </ActionIcon>

                            <ActionIcon
                                size="lg"
                                radius="xl"
                                color={showParticipants ? "violet" : "gray"}
                                variant={showParticipants ? "filled" : "light"}
                                onClick={() => setShowParticipants(!showParticipants)}
                                style={{
                                    backgroundColor: showParticipants ? 'var(--mantine-color-violet-6)' : 'var(--mantine-color-gray-1)',
                                    border: showParticipants ? 'none' : '1px solid var(--mantine-color-gray-3)',
                                    boxShadow: showParticipants ? '0 2px 8px rgba(139, 69, 255, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <IconUsers size={18} />
                            </ActionIcon>
                        </Group>

                        <Divider orientation="vertical" size="sm" />

                        {/* Bouton quitter */}
                        <Button
                            size="lg"
                            color="red"
                            leftSection={<IconPhoneOff size={20} />}
                            onClick={handleLeaveCall}
                            loading={isLeaving}
                            radius="xl"
                            style={{
                                backgroundColor: 'var(--mantine-color-red-6)',
                                boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)',
                                fontWeight: 600
                            }}
                        >
                            Quitter
                        </Button>
                    </Group>
                </Box>

                {/* Overlay de chargement pour quitter */}
                {isLeaving && (
                    <Overlay color="#000" backgroundOpacity={0.8}>
                        <Center h="100%">
                            <Stack align="center" gap="md">
                                <Loader size="lg" color="white" />
                                <Text c="white" size="lg">
                                    Déconnexion en cours...
                                </Text>
                            </Stack>
                        </Center>
                    </Overlay>
                )}
            </Box>
        </MainLayout>
    );
};

export default VideoCallPage;