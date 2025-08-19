// TODO: Alerte d'erreur générique
// - Affiche un message d'erreur, permet de fermer

import React from 'react';
import { Alert, Button, Group } from '@mantine/core';

export interface ErrorAlertProps {
    message: string;
    onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
    return (
        <Alert color="red" title="Erreur">
            <Group justify="space-between" wrap="nowrap">
                <div>{message}</div>
                {onClose && (
                    <Button variant="light" size="xs" onClick={onClose}>
                        Fermer
                    </Button>
                )}
            </Group>
        </Alert>
    );
};

export default ErrorAlert;
