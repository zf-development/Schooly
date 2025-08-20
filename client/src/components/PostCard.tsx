import React from 'react';
import {
    Card,
    Text,
    Group,
    Badge,
    Avatar,
    Stack,
    ActionIcon,
    Divider,
    Box,
    Flex
} from '@mantine/core';
import { IconFlag, IconClock, IconBuilding } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './PostCard.module.css';

export interface PostCardProps {
    id: string;
    title?: string;
    author: {
        id: string;
        name: string;
        display_name: string;
        avatar_url: string;
        institution: string;
    };
    content: string;
    visibility: 'public' | 'private';
    createdAt: string | Date;
    onReport?: (postId: string, postTitle?: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
    id,
    title,
    author,
    content,
    visibility,
    createdAt,
    onReport
}) => {
    const formatDate = (date: string | Date) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return format(dateObj, 'dd MMM yyyy à HH:mm', { locale: fr });
        } catch {
            return String(date);
        }
    };

    const getVisibilityColor = (vis: 'public' | 'private') => {
        return vis === 'public' ? 'blue' : 'yellow';
    };

    const getVisibilityLabel = (vis: 'public' | 'private') => {
        return vis === 'public' ? 'Public' : 'Privé';
    };

    return (
        <Card
            withBorder
            padding="lg"
            radius="md"
            shadow="xs"
            className={styles.postCard}
        >
            {/* Header avec avatar et informations de l'auteur */}
            <Group justify="space-between" align="flex-start" mb="md">
                <Group gap="md" align="flex-start">
                    <Avatar
                        src={author.avatar_url}
                        size="lg"
                        radius="xl"
                        alt={`Avatar de ${author.display_name}`}
                        className={styles.avatar}
                    />
                    <Stack gap={4}>
                        <Text fw={700} size="md" c="dark.7">
                            {author.display_name}
                        </Text>
                        <Group gap="xs" align="center">
                            <IconBuilding size={14} color="var(--mantine-color-gray-6)" />
                            <Text size="sm" c="dimmed" fw={500}>
                                {author.institution}
                            </Text>
                        </Group>
                    </Stack>
                </Group>

                <Group gap="xs" align="center">
                    <Badge
                        variant="light"
                        color={getVisibilityColor(visibility)}
                        size="sm"
                        radius="sm"
                        className={styles.visibilityBadge}
                        style={{
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {getVisibilityLabel(visibility)}
                    </Badge>

                    {onReport && (
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={() => onReport(id, title)}
                            title="Signaler ce post"
                            className={styles.reportButton}
                        >
                            <IconFlag size={16} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>

            <Divider mb="md" color="gray.2" />

            {/* Contenu du post */}
            <Stack gap="md">
                {title && (
                    <Box>
                        <Text
                            fw={700}
                            size="lg"
                            c="dark.8"
                            style={{
                                lineHeight: 1.3,
                                marginBottom: '8px'
                            }}
                        >
                            {title}
                        </Text>
                    </Box>
                )}

                <Box>
                    <Text
                        size="sm"
                        c="dark.7"
                        style={{
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                    >
                        {content}
                    </Text>
                </Box>
            </Stack>

            {/* Footer avec timestamp */}
            <Group justify="space-between" align="center" mt="lg" pt="md">
                <Group gap="xs" align="center">
                    <IconClock size={14} color="var(--mantine-color-gray-5)" />
                    <Text size="xs" c="dimmed" fw={500}>
                        {formatDate(createdAt)}
                    </Text>
                </Group>

                <Box style={{ opacity: 0.6 }}>
                    <Text size="xs" c="dimmed" ta="right">
                        Post #{id.slice(0, 8)}
                    </Text>
                </Box>
            </Group>
        </Card>
    );
};

export default PostCard;
