import React from 'react';
import { Group, Badge, Text } from '@mantine/core';
import { IconHash } from '@tabler/icons-react';

interface HashtagListProps {
    hashtags: string[];
    onHashtagClick?: (hashtag: string) => void;
    maxDisplay?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'light' | 'filled' | 'outline' | 'dot' | 'gradient';
    color?: string;
}

const HashtagList: React.FC<HashtagListProps> = ({
    hashtags,
    onHashtagClick,
    maxDisplay = 5,
    size = 'sm',
    variant = 'filled',
    color = 'grape'
}) => {
    if (!hashtags || hashtags.length === 0) {
        return null;
    }

    const displayHashtags = hashtags.slice(0, maxDisplay);
    const remainingCount = hashtags.length - maxDisplay;

    const handleHashtagClick = (hashtag: string) => {
        if (onHashtagClick) {
            onHashtagClick(hashtag);
        }
    };

    return (
        <Group gap="xs" align="center">
            {displayHashtags.map((hashtag, index) => (
                <Badge
                    key={index}
                    variant={variant}
                    color={color}
                    size={size}
                    leftSection={<IconHash size={12} />}
                    style={{ cursor: onHashtagClick ? 'pointer' : 'default' }}
                    onClick={() => handleHashtagClick(hashtag)}
                >
                    {hashtag}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Text size="xs" c="dimmed">
                    +{remainingCount} autres
                </Text>
            )}
        </Group>
    );
};

export default HashtagList;
