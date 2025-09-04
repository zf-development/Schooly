// TODO: Liste de posts
// - Afficher une liste de PostCard

import React from "react";
import {
    Stack,
    Text,
    Center,
    Skeleton,
    Group,
    Avatar,
    Card,
    Divider,
    Box,
} from "@mantine/core";
import PostCard from "./PostCard";
import type { Post } from "../types";
import styles from "./PostCard.module.css";

interface FeedListProps {
    posts: Post[];
    loading: boolean;
    onReport?: (postId: string, postTitle?: string) => void;
}

// Composant Skeleton pour un post qui représente fidèlement PostCard
const PostSkeleton: React.FC = () => (
    <Card
        withBorder
        padding="lg"
        radius="md"
        shadow="xs"
        w="36.5vw"
        className={styles.postCard}
    >
        {/* Header avec avatar et informations de l'auteur */}
        <Group justify="space-between" align="flex-start" mb="md">
            <Group gap="md" align="flex-start">
                <Skeleton height={48} width={48} circle />
                <Stack gap={4}>
                    <Skeleton height={20} width={120} />
                    <Group gap="xs" align="center">
                        <Skeleton height={14} width={14} circle />
                        <Skeleton height={16} width={100} />
                    </Group>
                </Stack>
            </Group>

            <Group gap="xs" align="center">
                <Skeleton height={24} width={60} radius="sm" />
                <Skeleton height={28} width={28} circle />
            </Group>
        </Group>

        <Divider mb="md" color="gray.2" />

        {/* Contenu du post */}
        <Stack gap="md">
            {/* Titre (optionnel) */}
            <Box>
                <Skeleton height={24} width="80%" mb={8} />
            </Box>

            {/* Contenu */}
            <Box>
                <Skeleton height={16} width="100%" mb={4} />
                <Skeleton height={16} width="95%" mb={4} />
                <Skeleton height={16} width="85%" mb={4} />
                <Skeleton height={16} width="70%" />
            </Box>
        </Stack>

        {/* Footer avec timestamp */}
        <Group justify="space-between" align="center" mt="lg" pt="md">
            <Group gap="xs" align="center">
                <Skeleton height={14} width={14} circle />
                <Skeleton height={14} width={80} />
            </Group>

            <Skeleton height={12} width={60} />
        </Group>
    </Card>
);

const FeedList: React.FC<FeedListProps> = ({ posts, loading, onReport }) => {
    if (loading) {
        return (
            <Stack gap="md">
                {[...Array(3)].map((_, index) => (
                    <PostSkeleton key={index} />
                ))}
            </Stack>
        );
    }

    if (posts.length === 0) {
        return (
            <Center py="xl">
                <Text c="dimmed" size="lg">
                    Aucun post pour le moment. Soyez le premier à partager
                    quelque chose !
                </Text>
            </Center>
        );
    }

    return (
        <Stack gap="md">
            {posts.map((post, index) => (
                <div
                    key={post.id}
                    className={index === 0 ? styles.newPost : ""}
                >
                    <PostCard
                        id={post.id}
                        title={post.title}
                        author={{
                            ...post.author,
                            institution_id: post.author.institution,
                        }}
                        content={post.content}
                        visibility={post.visibility}
                        createdAt={post.createdAt}
                        files={post.files}
                        upvotes={post.upvotes}
                        comments={post.comments}
                        hasUpvoted={post.hasUpvoted}
                        onReport={onReport}
                    />
                </div>
            ))}
        </Stack>
    );
};

export default FeedList;
