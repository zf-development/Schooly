import React from 'react';
import { Box, Skeleton, Stack, Group } from '@mantine/core';

const NotesSidebarSkeleton: React.FC = () => {
    return (
        <Box
            w={320}
            h="100vh"
            style={{
                backgroundColor: 'white',
                borderRight: '1px solid var(--mantine-color-gray-3)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header Skeleton */}
            <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Group justify="center" mb="md">
                    <Group gap="xs">
                        <Skeleton height={20} width={20} radius="sm" animate />
                        <Skeleton height={16} width={80} animate />
                    </Group>
                </Group>

                {/* Search bar skeleton */}
                <Skeleton height={36} radius="sm" animate />
            </Box>

            {/* File list skeleton */}
            <Box style={{ flex: 1 }} p="md">
                <Stack gap="xs">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Group key={index} gap="xs" p="xs">
                            <Skeleton height={16} width={16} animate />
                            <Skeleton height={14} width={`${Math.random() * 60 + 60}%`} animate />
                        </Group>
                    ))}

                    {/* Folder with children */}
                    <Group gap="xs" p="xs">
                        <Skeleton height={16} width={16} animate />
                        <Skeleton height={14} width="70%" animate />
                    </Group>

                    {/* Nested items */}
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Group key={`nested-${index}`} gap="xs" p="xs" pl="xl">
                            <Skeleton height={16} width={16} animate />
                            <Skeleton height={14} width={`${Math.random() * 50 + 40}%`} animate />
                        </Group>
                    ))}
                </Stack>
            </Box>

            {/* New page button skeleton */}
            <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                <Skeleton height={36} radius="sm" animate />
            </Box>
        </Box>
    );
};

export default NotesSidebarSkeleton;
