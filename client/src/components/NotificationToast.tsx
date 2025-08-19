// TODO: Notification toast
// - Placeholder sans @mantine/notifications, à remplacer plus tard

import React from 'react';
import { Alert } from '@mantine/core';

export interface NotificationToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type }) => {
    const color = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';
    return <Alert color={color}>{message}</Alert>;
};

export default NotificationToast;
