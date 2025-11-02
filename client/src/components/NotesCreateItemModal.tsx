import React, { useState } from 'react';
import { Modal, TextInput, Button, Group, Stack } from '@mantine/core';
import { IconFile, IconFolder } from '@tabler/icons-react';

interface NotesCreateItemModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    type: 'page' | 'folder';
    title?: string;
    loading?: boolean;
}

const NotesCreateItemModal: React.FC<NotesCreateItemModalProps> = ({
    opened,
    onClose,
    onConfirm,
    type,
    title,
    loading = false
}) => {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onConfirm(name.trim());
            setName(''); // Reset après confirmation
        }
    };

    const handleClose = () => {
        setName(''); // Reset au close
        onClose();
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    const icon = type === 'folder' ? <IconFolder size={16} /> : <IconFile size={16} />;
    const defaultTitle = type === 'folder' ? 'Nouveau dossier' : 'Nouvelle page';
    const placeholder = type === 'folder' ? 'Nom du dossier' : 'Nom de la page';

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={title || defaultTitle}
            centered
            size="sm"
        >
            <Stack gap="md">
                <TextInput
                    leftSection={icon}
                    placeholder={placeholder}
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    data-autofocus
                />

                <Group justify="flex-end" gap="sm">
                    <Button
                        variant="subtle"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || loading}
                        loading={loading}
                    >
                        Créer
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default NotesCreateItemModal;
