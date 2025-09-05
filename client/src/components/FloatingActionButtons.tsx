import React, { useState } from 'react';
import {
    Group,
    ActionIcon,
    Tooltip,
    Paper,
    Stack,
    Text,
    Switch,
    Divider,
    Box,
    Badge
} from '@mantine/core';
import {
    IconBell,
    IconBellOff,
    IconSun,
    IconMoon,
    IconPalette,
    IconSettings,
    IconChevronUp,
    IconChevronDown
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import NotificationTray from './NotificationTray';

interface FloatingActionButtonsProps {
    notificationCount?: number;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({ 
    notificationCount = 0 
}) => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleNotificationClick = () => {
        setNotificationsOpen(!notificationsOpen);
        setThemeMenuOpen(false);
    };

    const handleThemeClick = () => {
        setThemeMenuOpen(!themeMenuOpen);
        setNotificationsOpen(false);
    };

    const handleExpand = () => {
        setExpanded(!expanded);
        setThemeMenuOpen(false);
        setNotificationsOpen(false);
    };

    return (
        <>
            {/* Boutons flottants */}
            <Paper
                shadow="xl"
                radius="md"
                p="sm"
                style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 1000,
                    border: '1px solid var(--mantine-color-gray-3)',
                    backgroundColor: 'var(--mantine-color-body)',
                    transition: 'all 0.3s ease'
                }}
            >
                <Stack gap="sm">
                    {/* Bouton d'expansion */}
                    <Tooltip label={expanded ? "Réduire" : "Expander"}>
                        <ActionIcon
                            size="lg"
                            variant="light"
                            color="gray"
                            onClick={handleExpand}
                        >
                            {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                        </ActionIcon>
                    </Tooltip>

                    {expanded && (
                        <>
                            <Divider />
                            
                            {/* Bouton de notifications */}
                            <Tooltip label="Notifications">
                                <ActionIcon
                                    size="lg"
                                    variant="light"
                                    color="violet"
                                    onClick={handleNotificationClick}
                                    style={{
                                        position: 'relative'
                                    }}
                                >
                                    {notificationsOpen ? <IconBellOff size={18} /> : <IconBell size={18} />}
                                    {notificationCount > 0 && (
                                        <Badge
                                            size="xs"
                                            color="red"
                                            variant="filled"
                                            style={{
                                                position: 'absolute',
                                                top: -5,
                                                right: -5,
                                                minWidth: 18,
                                                height: 18,
                                                fontSize: 10,
                                                padding: '0 4px'
                                            }}
                                        >
                                            {notificationCount > 99 ? '99+' : notificationCount}
                                        </Badge>
                                    )}
                                </ActionIcon>
                            </Tooltip>

                            {/* Bouton de thème */}
                            <Tooltip label="Thème">
                                <ActionIcon
                                    size="lg"
                                    variant="light"
                                    color="yellow"
                                    onClick={handleThemeClick}
                                >
                                    <IconPalette size={18} />
                                </ActionIcon>
                            </Tooltip>

                            {/* Bouton de paramètres */}
                            <Tooltip label="Paramètres">
                                <ActionIcon
                                    size="lg"
                                    variant="light"
                                    color="gray"
                                >
                                    <IconSettings size={18} />
                                </ActionIcon>
                            </Tooltip>
                        </>
                    )}
                </Stack>
            </Paper>

            {/* Menu de thème */}
            {themeMenuOpen && (
                <Paper
                    shadow="xl"
                    radius="md"
                    p="md"
                    style={{
                        position: 'fixed',
                        top: expanded ? 120 : 80,
                        right: 20,
                        zIndex: 1000,
                        width: 200,
                        border: '1px solid var(--mantine-color-gray-3)',
                        backgroundColor: 'var(--mantine-color-body)'
                    }}
                >
                    <Stack gap="sm">
                        <Text fw={500} size="sm">
                            Apparence
                        </Text>
                        
                        <Group justify="space-between" align="center">
                            <Group gap="xs">
                                {colorScheme === 'light' ? (
                                    <IconSun size={16} />
                                ) : (
                                    <IconMoon size={16} />
                                )}
                                <Text size="sm">
                                    Mode sombre
                                </Text>
                            </Group>
                            <Switch
                                checked={colorScheme === 'dark'}
                                onChange={toggleColorScheme}
                                size="sm"
                            />
                        </Group>

                        <Divider />

                        <Text size="xs" c="dimmed">
                            Personnalisez l'apparence de l'application
                        </Text>
                    </Stack>
                </Paper>
            )}

            {/* Tray de notifications */}
            <NotificationTray 
                isOpen={notificationsOpen} 
                onClose={() => setNotificationsOpen(false)} 
            />
        </>
    );
};

export default FloatingActionButtons;
