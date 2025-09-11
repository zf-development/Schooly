import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Title,
    Stack,
    Text,
    Group,
    Badge,
    Button,
    Paper,
    SimpleGrid,
    ThemeIcon,
    Center,
    Loader,
    Avatar,
    ActionIcon,
    Tabs,
    Divider,
    Flex,
    Grid,
    TextInput,
    Overlay
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
    IconStar,
    IconVolumeOff
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

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

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
        if (count <= 2) return 12;
        if (count <= 4) return 6;
        if (count <= 9) return 4;
        return 3;
    };

    const currentUser = callInfo.participants.find(p => p.id === user?.id) || callInfo.participants[0];

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
            <Box style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* En-tête compact avec informations essentielles */}
                <Paper withBorder p="sm" radius={0} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    <Group justify="space-between" align="center">
                        <Group gap="md">
                            <div>
                                <Title order={4} size="h5" mb={2}>
                                    {callInfo.title}
                                </Title>
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">
                                        {formatTime(currentTime)}
                                    </Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">
                                        {callInfo.participants.length} participant{callInfo.participants.length > 1 ? 's' : ''}
                                    </Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">
                                        ID: {callInfo.meetingId}
                                    </Text>
                                </Group>
                            </div>
                        </Group>
                        
                        <Group gap="xs">
                            <Badge color="green" variant="light" size="sm">
                                En cours
                            </Badge>
                            {callInfo.isRecording && (
                                <Badge color="red" variant="light" size="sm">
                                    Enregistrement
                                </Badge>
                            )}
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="sm"
                            >
                                <IconSettings size={16} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Paper>

                {/* Zone principale avec layout optimisé */}
                <Flex style={{ flex: 1, minHeight: 0 }}>
                    {/* Zone vidéo principale */}
                    <Box style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                        {callInfo.isScreenSharing ? (
                            <Box style={{ height: '100%', position: 'relative' }}>
                                {/* Écran partagé avec overlay d'informations */}
                                <Box
                                    style={{
                                        height: '100%',
                                        backgroundColor: '#1a1a1a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
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
                            <Box style={{ height: '100%', padding: 16 }}>
                                <Grid style={{ height: '100%', margin: 0 }} gutter="sm">
                                    {callInfo.participants.map((participant) => (
                                        <Grid.Col
                                            key={participant.id}
                                            span={getParticipantGridCols(callInfo.participants.length)}
                                            style={{ minHeight: 200 }}
                                        >
                                            <Paper
                                                withBorder
                                                p={0}
                                                radius="md"
                                                style={{
                                                    height: '100%',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    backgroundColor: '#2a2a2a'
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
                                                            backgroundColor: '#3a3a3a'
                                                        }}
                                                    >
                                                        <Text size="sm" c="white">
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
                                                            backgroundColor: '#3a3a3a',
                                                            padding: 16
                                                        }}
                                                    >
                                                        <Avatar
                                                            src={participant.avatar}
                                                            size="xl"
                                                            radius="xl"
                                                        />
                                                        <Text size="sm" c="white" mt="md" ta="center" fw={500}>
                                                            {participant.name}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" ta="center">
                                                            {participant.role === 'host' ? 'Organisateur' : 
                                                             participant.role === 'presenter' ? 'Présentateur' : 'Participant'}
                                                        </Text>
                                                    </Box>
                                                )}
                                                
                                                {/* Indicateurs de statut en overlay */}
                                                <Box
                                                    style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        left: 8,
                                                        right: 8,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start'
                                                    }}
                                                >
                                                    <Group gap="xs">
                                                        {participant.isHost && (
                                                            <Badge color="blue" variant="filled" size="xs">
                                                                Organisateur
                                                            </Badge>
                                                        )}
                                                        {participant.role === 'presenter' && (
                                                            <Badge color="green" variant="filled" size="xs">
                                                                Présentateur
                                                            </Badge>
                                                        )}
                                                    </Group>
                                                    
                                                    <Group gap="xs">
                                                        {!participant.isAudioOn && (
                                                            <ThemeIcon size="sm" color="red" radius="xl">
                                                                <IconMicrophoneOff size={12} />
                                                            </ThemeIcon>
                                                        )}
                                                        {participant.isMuted && (
                                                            <ThemeIcon size="sm" color="red" radius="xl">
                                                                <IconVolumeOff size={12} />
                                                            </ThemeIcon>
                                                        )}
                                                    </Group>
                                                </Box>
                                            </Paper>
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>

                    {/* Panneau latéral compact */}
                    {showChat && (
                        <Box
                            style={{
                                width: 320,
                                borderLeft: '1px solid var(--mantine-color-gray-3)',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'var(--mantine-color-gray-0)'
                            }}
                        >
                            <Tabs value={showParticipants ? 'participants' : 'chat'} onChange={(value) => setShowParticipants(value === 'participants')}>
                                <Tabs.List style={{ margin: 0 }}>
                                    <Tabs.Tab value="chat" leftSection={<IconMessageCircle size={14} />} style={{ flex: 1 }}>
                                        Chat
                                    </Tabs.Tab>
                                    <Tabs.Tab value="participants" leftSection={<IconUsers size={14} />} style={{ flex: 1 }}>
                                        ({callInfo.participants.length})
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="chat" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                                        <Stack gap="xs">
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
                                                            backgroundColor: message.isOwn ? 'var(--mantine-color-blue-6)' : 'white',
                                                            color: message.isOwn ? 'white' : 'var(--mantine-color-gray-8)',
                                                            padding: 8,
                                                            borderRadius: 12,
                                                            fontSize: 13,
                                                            border: message.isOwn ? 'none' : '1px solid var(--mantine-color-gray-2)'
                                                        }}
                                                    >
                                                        {!message.isOwn && message.type === 'message' && (
                                                            <Text size="xs" c="dimmed" mb={2} fw={500}>
                                                                {message.author.name}
                                                            </Text>
                                                        )}
                                                        <Text size="sm">
                                                            {message.content}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" mt={2} style={{ opacity: 0.7 }}>
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
                                    </Box>
                                    
                                    <Box style={{ padding: 12, borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                                        <Group gap="xs">
                                            <TextInput
                                                placeholder="Tapez un message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                style={{ flex: 1 }}
                                                size="sm"
                                                radius="xl"
                                            />
                                            <ActionIcon
                                                size="sm"
                                                radius="xl"
                                                color="blue"
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                            >
                                                <IconSend size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Box>
                                </Tabs.Panel>

                                <Tabs.Panel value="participants" style={{ flex: 1, padding: 12 }}>
                                    <Stack gap="xs">
                                        {callInfo.participants.map((participant) => (
                                            <Paper key={participant.id} p="sm" radius="md" withBorder>
                                                <Group justify="space-between" align="center">
                                                    <Group gap="sm">
                                                        <Avatar
                                                            src={participant.avatar}
                                                            size="sm"
                                                            radius="xl"
                                                        />
                                                        <div>
                                                            <Text size="sm" fw={500}>
                                                                {participant.name}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
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
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Tabs.Panel>
                            </Tabs>
                        </Box>
                    )}
                </Flex>

                {/* Contrôles flottants en bas */}
                <Paper
                    withBorder
                    p="md"
                    radius="md"
                    style={{
                        margin: 16,
                        backgroundColor: 'var(--mantine-color-white)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Group justify="center" gap="md">
                        <ActionIcon
                            size="lg"
                            radius="xl"
                            color={callInfo.isMuted ? "red" : "gray"}
                            variant={callInfo.isMuted ? "filled" : "light"}
                            onClick={handleToggleAudio}
                        >
                            {callInfo.isMuted ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />}
                        </ActionIcon>

                        <ActionIcon
                            size="lg"
                            radius="xl"
                            color={callInfo.isVideoOn ? "blue" : "red"}
                            variant={callInfo.isVideoOn ? "filled" : "light"}
                            onClick={handleToggleVideo}
                        >
                            {callInfo.isVideoOn ? <IconVideo size={20} /> : <IconVideoOff size={20} />}
                        </ActionIcon>

                        <ActionIcon
                            size="lg"
                            radius="xl"
                            color={callInfo.isScreenSharing ? "green" : "gray"}
                            variant={callInfo.isScreenSharing ? "filled" : "light"}
                            onClick={handleToggleScreenShare}
                        >
                            {callInfo.isScreenSharing ? <IconScreenShareOff size={20} /> : <IconScreenShare size={20} />}
                        </ActionIcon>

                        <Divider orientation="vertical" />

                        <ActionIcon
                            size="lg"
                            radius="xl"
                            color={showChat ? "blue" : "gray"}
                            variant={showChat ? "filled" : "light"}
                            onClick={() => setShowChat(!showChat)}
                        >
                            <IconMessageCircle size={20} />
                        </ActionIcon>

                        <ActionIcon
                            size="lg"
                            radius="xl"
                            color={showParticipants ? "blue" : "gray"}
                            variant={showParticipants ? "filled" : "light"}
                            onClick={() => setShowParticipants(!showParticipants)}
                        >
                            <IconUsers size={20} />
                        </ActionIcon>

                        <Divider orientation="vertical" />

                        <Button
                            size="md"
                            color="red"
                            leftSection={<IconPhoneOff size={18} />}
                            onClick={handleLeaveCall}
                            loading={isLeaving}
                            radius="xl"
                        >
                            Quitter
                        </Button>
                    </Group>
                </Paper>

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