// TODO: Header de l'application
// - Affiche le logo, l'InstitutionSelector et l'AuthButton
// - Déclenche onInstitutionChange lors d'un changement d'école

import React from 'react';
import { Group, Title } from '@mantine/core';
import InstitutionSelector from './InstitutionSelector';
import AuthButton from './AuthButton';

export interface HeaderProps {
    onInstitutionChange: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onInstitutionChange }) => {
    // TODO: Récupérer les institutions depuis un service ou contexte
    const institutions = [
        { id: 'mgr', name: 'MGR Parent' },
        { id: 'cem', name: 'Cégep Édouard-Montpetit' },
    ];

    return (
        <Group justify="space-between" p="md">
            <Title order={3}>StudBud</Title>
            <Group>
                <InstitutionSelector
                    institutions={institutions}
                    selectedId={institutions[0].id}
                    onChange={onInstitutionChange}
                />
                <AuthButton isAuthenticated={false} onLogin={() => { }} onLogout={() => { }} />
            </Group>
        </Group>
    );
};

export default Header;
