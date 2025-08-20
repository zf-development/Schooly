import React from 'react';
import { Card, Text, Group, Badge, Avatar, Stack, Button, ActionIcon } from '@mantine/core';
import { IconFlag, IconDotsVertical } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface PostCardProps {
    id: string;
    title?: string;
    author: {
        id: string;
        name: string;
        display_name: string;
        avatar_url: string;
        institution: string
    };
    content: string;
    visibility: 'public' | 'private';
    createdAt: string | Date;
    onReport?: (postId: string, postTitle?: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ id, title, author, content, visibility, createdAt, onReport }) => {
    const formatDate = (date: string | Date) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return format(dateObj, 'dd MMM yyyy à HH:mm', { locale: fr });
        } catch {
            return String(date);
        }
    };

    return (
        <Card withBorder padding="md" radius="md" shadow="sm">
            <Group justify="space-between" mb="xs">
                <Group gap="sm">
                    <Avatar
                        src={author.avatar_url}
                        size="md"
                        radius="xl"
                        alt={`Avatar de ${author.display_name}`}
                    />
                    <Stack gap={0}>
                        <Text fw={600} size="sm">{author.display_name}</Text>
                        <Text size="xs" c="dimmed">{author.institution}</Text>
                    </Stack>
                </Group>
                <Group gap="xs">
                    <Badge
                        variant="light"
                        color={visibility === 'public' ? 'green' : 'yellow'}
                        size="sm"
                    >
                        {visibility === 'public' ? 'Public' : 'Privé'}
                    </Badge>
                    {onReport && (
                        <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            onClick={() => onReport(id, title)}
                            title="Signaler ce post"
                        >
                            <IconFlag size={16} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>

            {title && (
                <Text fw={600} size="md" mt="md" mb="xs">
                    {title}
                </Text>
            )}

            <Text size="sm" mt="md" style={{ lineHeight: 1.5 }}>
                {content}
            </Text>

            <Text size="xs" c="dimmed" mt="md" ta="right">
                {formatDate(createdAt)}
            </Text>
        </Card>
    );
};

export default PostCard;
