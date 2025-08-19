// TODO: Liste de posts
// - Afficher une liste de PostCard

import React from 'react';
import { Stack, Text, Loader, Center } from '@mantine/core';
import PostCard from './PostCard';

export type Post = {
    id: string;
    author: { id: string; name: string; institution: string };
    content: string;
    visibility: 'public' | 'private';
    createdAt: string | Date;
};

export interface FeedListProps {
    posts: Post[];
    loading: boolean;
}

const FeedList: React.FC<FeedListProps> = ({ posts, loading }) => {
    if (loading) {
        return (
            <Center py="lg">
                <Loader />
            </Center>
        );
    }

    if (!posts || posts.length === 0) {
        return <Text c="dimmed">Aucun post à afficher</Text>;
    }

    return (
        <Stack>
            {posts.map((p) => (
                <PostCard key={p.id} author={p.author} content={p.content} visibility={p.visibility} createdAt={p.createdAt} />
            ))}
        </Stack>
    );
};

export default FeedList;
