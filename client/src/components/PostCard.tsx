import React from 'react';
import { Card, Text, Group, Badge } from '@mantine/core';

export interface PostCardProps {
    author: { id: string; name: string; institution: string };
    content: string;
    visibility: 'public' | 'private';
    createdAt: string | Date;
}

const PostCard: React.FC<PostCardProps> = ({ author, content, visibility, createdAt }) => {
    return (
        <Card withBorder padding="md" radius="md">
            <Group justify="space-between" mb="xs">
                <div>
                    <Text fw={600}>{author.name}</Text>
                    <Text size="xs" c="dimmed">{author.institution}</Text>
                </div>
                <Badge variant="light" color={visibility === 'public' ? 'green' : 'yellow'}>{visibility}</Badge>
            </Group>
            <Text>{content}</Text>
            <Text size="xs" c="dimmed" mt="sm">{String(createdAt)}</Text>
        </Card>
    );
};

export default PostCard;
