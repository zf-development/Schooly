import React, { useState, useEffect } from 'react';
import {
    Paper,
    Text,
    Group,
    Badge,
    ActionIcon,
    Stack,
    ScrollArea,
    Button,
    Divider,
    Avatar,
    Box,
    Menu,
    Tooltip,
    ThemeIcon,
    Center,
} from '@mantine/core';
import {
    IconBell,
    IconBellOff,
    IconX,
    IconCheck,
    IconChecks,
    IconSettings,
    IconTrash,
    IconMessage,
    IconHeart,
    IconCalendar,
    IconFile,
    IconAlertCircle,
    IconInfoCircle,
    IconCircleCheck,
    IconDots
} from '@tabler/icons-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'message' | 'like' | 'event' | 'file' | 'system' | 'warning' | 'info' | 'success';
    isRead: boolean;
    timestamp: Date;
    sender?: {
        name: string;
        avatar?: string;
    };
    actionUrl?: string;
    metadata?: Record<string, any>;
}

interface NotificationTrayProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationTray: React.FC<NotificationTrayProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    // Données d'exemple
    useEffect(() => {
        const sampleNotifications: Notification[] = [
            {
                id: '1',
                title: 'Nouveau message',
                message: 'Marie Dubois vous a envoyé un message',
                type: 'message',
                isRead: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
                sender: {
                    name: 'Marie Dubois',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                },
                actionUrl: '/messaging'
            },
            {
                id: '2',
                title: 'Post liké',
                message: 'Pierre Martin a aimé votre post "Nouveau projet"',
                type: 'like',
                isRead: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                sender: {
                    name: 'Pierre Martin',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                },
                actionUrl: '/feed'
            },
            {
                id: '3',
                title: 'Événement à venir',
                message: 'Examen de Mathématiques dans 2 heures',
                type: 'event',
                isRead: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                metadata: {
                    eventId: '123',
                    eventTime: new Date(Date.now() + 1000 * 60 * 60 * 2) // 2 hours from now
                },
                actionUrl: '/calendar'
            },
            {
                id: '4',
                title: 'Fichier partagé',
                message: 'Sophie Laurent a partagé un fichier avec vous',
                type: 'file',
                isRead: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
                sender: {
                    name: 'Sophie Laurent',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
                },
                actionUrl: '/files'
            },
            {
                id: '5',
                title: 'Mise à jour système',
                message: 'Nouvelle version disponible avec des améliorations',
                type: 'system',
                isRead: true,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                actionUrl: '/settings'
            },
            {
                id: '6',
                title: 'Invitation au groupe',
                message: 'Vous avez été invité à rejoindre le groupe "Projet Web"',
                type: 'info',
                isRead: false,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
                sender: {
                    name: 'Prof. Durand',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                },
                actionUrl: '/groups'
            }
        ];

        setNotifications(sampleNotifications);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message': return <IconMessage size={16} />;
            case 'like': return <IconHeart size={16} />;
            case 'event': return <IconCalendar size={16} />;
            case 'file': return <IconFile size={16} />;
            case 'system': return <IconSettings size={16} />;
            case 'warning': return <IconAlertCircle size={16} />;
            case 'info': return <IconInfoCircle size={16} />;
            case 'success': return <IconCircleCheck size={16} />;
            default: return <IconBell size={16} />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'message': return 'blue';
            case 'like': return 'red';
            case 'event': return 'violet';
            case 'file': return 'green';
            case 'system': return 'gray';
            case 'warning': return 'orange';
            case 'info': return 'cyan';
            case 'success': return 'green';
            default: return 'gray';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 1000 * 60) return 'Maintenant';
        if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m`;
        if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const handleMarkAsRead = (notificationId: string) => {
        setNotifications(notifications.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    };

    const handleDeleteNotification = (notificationId: string) => {
        setNotifications(notifications.filter(notif => notif.id !== notificationId));
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(notif => !notif.isRead).length;

    if (!isOpen) return null;

    return (
        <Paper
            shadow="xl"
            radius="md"
            p="md"
            style={{
                position: 'fixed',
                top: 60,
                right: 20,
                width: 400,
                maxHeight: 'calc(100vh - 80px)',
                zIndex: 1000,
                border: '1px solid var(--mantine-color-gray-3)'
            }}
        >
            <Stack gap="md" h="100%">
                {/* En-tête */}
                <Group justify="space-between" align="center">
                    <Group>
                        <Text fw={500} size="lg">
                            Notifications
                        </Text>
                        {unreadCount > 0 && (
                            <Badge size="sm" color="violet" variant="filled">
                                {unreadCount}
                            </Badge>
                        )}
                    </Group>
                    <Group gap="xs">
                        {unreadCount > 0 && (
                            <Tooltip label="Marquer tout comme lu">
                                <ActionIcon
                                    size="sm"
                                    variant="light"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <IconChecks size={14} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                        <Tooltip label="Fermer">
                            <ActionIcon
                                size="sm"
                                variant="light"
                                onClick={onClose}
                            >
                                <IconX size={14} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>

                <Divider />

                {/* Liste des notifications */}
                <ScrollArea h="calc(100vh - 200px)" style={{ flex: 1 }}>
                    {notifications.length > 0 ? (
                        <Stack gap="sm">
                            {notifications.map(notification => (
                                <Paper
                                    key={notification.id}
                                    p="sm"
                                    radius="md"
                                    style={{
                                        cursor: 'pointer',
                                        border: notification.isRead
                                            ? '1px solid var(--mantine-color-gray-2)'
                                            : '1px solid var(--mantine-color-violet-3)',
                                        backgroundColor: notification.isRead
                                            ? 'transparent'
                                            : 'var(--mantine-color-violet-0)'
                                    }}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    <Group justify="space-between" align="flex-start" mb="xs">
                                        <Group gap="sm" style={{ flex: 1 }}>
                                            <ThemeIcon
                                                size="sm"
                                                radius="md"
                                                color={getNotificationColor(notification.type)}
                                                variant="light"
                                            >
                                                {getNotificationIcon(notification.type)}
                                            </ThemeIcon>
                                            <Box style={{ flex: 1 }}>
                                                <Text fw={500} size="sm">
                                                    {notification.title}
                                                </Text>
                                                <Text size="xs" c="dimmed" lineClamp={2}>
                                                    {notification.message}
                                                </Text>
                                            </Box>
                                        </Group>
                                        <Group gap="xs">
                                            {!notification.isRead && (
                                                <Box
                                                    w={8}
                                                    h={8}
                                                    bg="violet"
                                                    style={{ borderRadius: '50%' }}
                                                />
                                            )}
                                            <Menu>
                                                <Menu.Target>
                                                    <ActionIcon size="sm" variant="subtle">
                                                        <IconDots size={12} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconCheck size={14} />}
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={notification.isRead}
                                                    >
                                                        Marquer comme lu
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                    >
                                                        Supprimer
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Group>

                                    <Group justify="space-between" align="center">
                                        <Group gap="xs">
                                            {notification.sender && (
                                                <Group gap="xs">
                                                    <Avatar
                                                        src={notification.sender.avatar}
                                                        size="xs"
                                                        radius="md"
                                                    />
                                                    <Text size="xs" c="dimmed">
                                                        {notification.sender.name}
                                                    </Text>
                                                </Group>
                                            )}
                                        </Group>
                                        <Text size="xs" c="dimmed">
                                            {formatTime(notification.timestamp)}
                                        </Text>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    ) : (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <ThemeIcon size={48} radius="md" color="gray" variant="light">
                                    <IconBellOff size={24} />
                                </ThemeIcon>
                                <Text size="sm" c="dimmed" ta="center">
                                    Aucune notification
                                </Text>
                                <Text size="xs" c="dimmed" ta="center">
                                    Vous êtes à jour !
                                </Text>
                            </Stack>
                        </Center>
                    )}
                </ScrollArea>

                {/* Actions en bas */}
                {notifications.length > 0 && (
                    <>
                        <Divider />
                        <Group justify="space-between">
                            <Button
                                variant="light"
                                size="sm"
                                leftSection={<IconSettings size={14} />}
                            >
                                Paramètres
                            </Button>
                            <Button
                                variant="light"
                                size="sm"
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={handleClearAll}
                            >
                                Tout effacer
                            </Button>
                        </Group>
                    </>
                )}
            </Stack>
        </Paper>
    );
};

export default NotificationTray;
