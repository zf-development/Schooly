// TODO: Footer simple pour le MVP
// - Liens statiques et informations légales (à compléter ensuite)

import React from 'react';
import { Group, Text } from '@mantine/core';

const Footer: React.FC = () => {
    return (
        <Group justify="space-between" p="md">
            <Text size="sm" c="dimmed">© {new Date().getFullYear()} StudBud</Text>
            <Text size="sm" c="dimmed">TODO: Liens (À propos, Contact)</Text>
        </Group>
    );
};

export default Footer;
