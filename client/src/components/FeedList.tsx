// TODO: Liste de posts
// - Afficher une liste de PostCard

import React from 'react';
import { Stack, Text, Center, Loader } from '@mantine/core';
import PostCard from './PostCard';
import type { Post } from '../types';

interface FeedListProps {
    posts: Post[];
    loading: boolean;
    onReport?: (postId: string, postTitle?: string) => void;
}

const FeedList: React.FC<FeedListProps> = ({ posts, loading, onReport }) => {
    if (loading) {
        return (
            <Center py="xl">
                <Loader size="lg" />
            </Center>
        );
    }

    if (posts.length === 0) {
        return (
            <Center py="xl">
                <Text c="dimmed" size="lg">
                    Aucun post pour le moment. Soyez le premier à partager quelque chose !
                </Text>
            </Center>
        );
    }

    return (
        <Stack gap="md">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    author={post.author}
                    content={post.content}
                    visibility={post.visibility}
                    createdAt={post.createdAt}
                    onReport={onReport}
                />
            ))}
        </Stack>
    );
};

export default FeedList;
