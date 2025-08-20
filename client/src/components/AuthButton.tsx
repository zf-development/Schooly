// TODO: Bouton de connexion (utilise Mantine)
// - Afficher l'état de connexion (connecté/déconnecté)
// - Gérer les actions de connexion/déconnexion
// - Utiliser les composants Mantine (Button, Menu, Avatar)

import React from 'react';
import { Button, Group, Avatar, Menu, Text } from '@mantine/core';
import { IconUser, IconLogout, IconLogin } from '@tabler/icons-react';
import type { AuthButtonProps } from '../types';

export const AuthButton: React.FC<AuthButtonProps> = ({ isAuthenticated, onLogin, onLogout, onProfile, userAvatar, userName }) => {
    if (!isAuthenticated) {
        return (
            <Button leftSection={<IconLogin size={16} />} variant="light" size="sm" onClick={onLogin}>
                Se connecter
            </Button>
        );
    }

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Button variant="light" size="sm">
                    <Group gap="xs">
                        <Avatar
                            size="sm"
                            src={userAvatar}
                            alt={userName || 'Avatar utilisateur'}
                            radius="xl"
                        />
                        <Text size="sm">{userName || 'Mon compte'}</Text>
                    </Group>
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconUser size={14} />}
                    onClick={onProfile}
                >
                    Profil
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={onLogout}>
                    Se déconnecter
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default AuthButton;
