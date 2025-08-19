import React from 'react';
import { Notification, Text } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IconCheck size={16} />;
      case 'error':
        return <IconX size={16} />;
      case 'info':
        return <IconInfoCircle size={16} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'info':
        return 'blue';
    }
  };

  return (
    <Notification
      icon={getIcon()}
      color={getColor()}
      title={type === 'success' ? 'Succès' : type === 'error' ? 'Erreur' : 'Information'}
      withCloseButton
    >
      <Text size="sm">{message}</Text>
    </Notification>
  );
};

export default NotificationToast;
