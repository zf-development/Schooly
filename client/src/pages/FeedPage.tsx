// TODO: Page principale (fil d'actualité)
// - Afficher la liste des posts avec PostCard via FeedList
// - Afficher le formulaire PostForm au-dessus du feed
// - Afficher une info bulle si aucun post n’est visible

import React, { useState } from 'react';
import { Alert, Container, Stack, Title } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';
import { FeedList, PostForm } from '../components';
import type { Post } from '../components/FeedList';

const FeedPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    const handleCreate = async (content: string, visibility: 'public' | 'private') => {
        // TODO: Remplacer par appel au service/création côté serveur
        const newPost: Post = {
            id: Math.random().toString(36).slice(2),
            author: { id: 'me', name: 'Utilisateur démo', institution: 'MGR Parent' },
            content,
            visibility,
            createdAt: new Date().toISOString(),
        };
        setPosts((p) => [newPost, ...p]);
    };

    const showEmptyInfo = !loading && posts.length === 0;

    return (
        <MainLayout>
            <Container size="sm" py="xl">
                <Stack gap="lg">
                    <Title order={2}>Fil d'actualité</Title>
                    <PostForm loading={loading} onSubmit={handleCreate} />

                    {showEmptyInfo && (
                        <Alert color="blue" title="Aucun post visible" variant="light">
                            Il n'y a pas encore de publication. Soyez le premier à partager une information.
                        </Alert>
                    )}

                    <FeedList posts={posts} loading={loading} />
                </Stack>
            </Container>
        </MainLayout>
    );
};

export default FeedPage;
