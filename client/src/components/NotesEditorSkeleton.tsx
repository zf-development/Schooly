import React from 'react';
import { Box, Skeleton, Stack, Group } from '@mantine/core';

const NotesEditorSkeleton: React.FC = () => {
    return (
        <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar Skeleton */}
            <Box
                p="md"
                style={{
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                    backgroundColor: 'white'
                }}
            >
                <Group justify="space-between">
                    <Group gap="xs">
                        <Skeleton height={24} width={120} animate />
                        <Skeleton height={14} width={150} animate />
                    </Group>

                    <Group gap="xs">
                        <Skeleton height={32} width={80} animate />
                        <Skeleton height={32} width={80} animate />
                        <Skeleton height={32} width={32} radius="sm" animate />
                    </Group>
                </Group>
            </Box>

            {/* Editor Content Skeleton */}
            <Box style={{ flex: 1, padding: '20px' }}>
                <Box style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Stack gap="lg">
                        {/* Title block */}
                        <Box>
                            <Skeleton height={36} width="60%" mb="sm" animate />
                        </Box>

                        {/* Paragraph blocks */}
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Box key={index}>
                                <Stack gap="xs">
                                    <Skeleton height={16} width="100%" animate />
                                    <Skeleton height={16} width="85%" animate />
                                    <Skeleton height={16} width={`${Math.random() * 30 + 60}%`} animate />
                                </Stack>
                            </Box>
                        ))}

                        {/* List block */}
                        <Box>
                            <Stack gap="xs">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Group key={index} gap="sm" align="flex-start">
                                        <Skeleton height={6} width={6} radius="xl" mt={6} animate />
                                        <Skeleton height={16} width={`${Math.random() * 40 + 50}%`} animate />
                                    </Group>
                                ))}
                            </Stack>
                        </Box>

                        {/* Quote block */}
                        <Box
                            p="md"
                            style={{
                                borderLeft: '4px solid var(--mantine-color-gray-3)',
                                backgroundColor: 'var(--mantine-color-gray-0)'
                            }}
                        >
                            <Skeleton height={16} width="80%" mb="xs" animate />
                            <Skeleton height={16} width="60%" animate />
                        </Box>

                        {/* Code block */}
                        <Box
                            p="md"
                            style={{
                                backgroundColor: 'var(--mantine-color-gray-1)',
                                borderRadius: '4px'
                            }}
                        >
                            <Stack gap="xs">
                                <Skeleton height={14} width="40%" animate />
                                <Skeleton height={14} width="70%" animate />
                                <Skeleton height={14} width="30%" animate />
                            </Stack>
                        </Box>

                        {/* More paragraph blocks */}
                        {Array.from({ length: 2 }).map((_, index) => (
                            <Box key={`end-${index}`}>
                                <Stack gap="xs">
                                    <Skeleton height={16} width="100%" animate />
                                    <Skeleton height={16} width="90%" animate />
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default NotesEditorSkeleton;
