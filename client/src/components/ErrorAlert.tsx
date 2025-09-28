import React from 'react';
import { Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title="Erreur"
      color="red"
      variant="light"
      withCloseButton={!!onClose}
      onClose={onClose}
    >
      <Text size="sm">{message}</Text>
    </Alert>
  );
};

export default ErrorAlert;
