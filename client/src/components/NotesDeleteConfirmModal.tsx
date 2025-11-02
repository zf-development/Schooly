import React from 'react';
import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { IconTrash, IconAlertTriangle } from '@tabler/icons-react';

interface NotesDeleteConfirmModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: 'page' | 'folder';
    loading?: boolean;
}

const NotesDeleteConfirmModal: React.FC<NotesDeleteConfirmModalProps> = ({
    opened,
    onClose,
    onConfirm,
    itemName,
    itemType,
    loading = false
}) => {
    const typeText = itemType === 'folder' ? 'dossier' : 'page';

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="sm">
                    <IconAlertTriangle size={20} color="red" />
                    <Text fw={600}>Confirmer la suppression</Text>
                </Group>
            }
            centered
            size="sm"
        >
            <Stack gap="md">
                <Text>
                    Êtes-vous sûr de vouloir supprimer {typeText === 'dossier' ? 'le' : 'la'} {typeText} <strong>"{itemName}"</strong> ?
                </Text>
                
                {itemType === 'folder' && (
                    <Text size="sm" c="dimmed">
                        ⚠️ Attention : Tous les éléments contenus dans ce dossier seront également supprimés.
                    </Text>
                )}
                
                <Text size="sm" c="red">
                    Cette action est irréversible.
                </Text>
                
                <Group justify="flex-end" gap="sm">
                    <Button 
                        variant="subtle" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button 
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        Supprimer
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default NotesDeleteConfirmModal;
