import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group, Stack } from '@mantine/core';
import { IconPencil, IconFile, IconFolder } from '@tabler/icons-react';

interface NotesRenameModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (newName: string) => void;
    currentName: string;
    itemType: 'page' | 'folder';
    loading?: boolean;
}

const NotesRenameModal: React.FC<NotesRenameModalProps> = ({
    opened,
    onClose,
    onConfirm,
    currentName,
    itemType,
    loading = false
}) => {
    const [name, setName] = useState(currentName);

    useEffect(() => {
        if (opened) {
            setName(currentName);
        }
    }, [opened, currentName]);

    const handleSubmit = () => {
        if (name.trim() && name.trim() !== currentName) {
            onConfirm(name.trim());
        }
    };

    const handleClose = () => {
        setName(currentName); // Reset au close
        onClose();
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    const icon = itemType === 'folder' ? <IconFolder size={16} /> : <IconFile size={16} />;
    const typeText = itemType === 'folder' ? 'dossier' : 'page';

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={`Renommer ${typeText === 'dossier' ? 'le' : 'la'} ${typeText}`}
            centered
            size="sm"
        >
            <Stack gap="md">
                <TextInput
                    leftSection={icon}
                    placeholder={`Nom ${typeText === 'dossier' ? 'du' : 'de la'} ${typeText}`}
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
                        leftSection={<IconPencil size={16} />}
                        onClick={handleSubmit}
                        disabled={!name.trim() || name.trim() === currentName || loading}
                        loading={loading}
                    >
                        Renommer
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default NotesRenameModal;
