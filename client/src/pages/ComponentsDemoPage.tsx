// TODO: Page de démo des composants
// - Démontrer les composants Mantine de base
// - Démontrer les composants personnalisés (AuthButton, PostCard, etc.)
// - Utiliser un layout de page

import React, { useState } from 'react';
import { Container, Stack, Title, Card, TextInput, Textarea, Button, Divider } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';
import { AuthButton, PostCard, LoginForm, PostForm, FeedList, InstitutionSelector, LoaderOverlay, ErrorAlert, NotificationToast, Header, Footer } from '../components';

const ComponentsDemoPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Données factices
    const institutions = [
        { id: 'mgr', name: 'MGR Parent' },
        { id: 'cem', name: 'Cégep Édouard-Montpetit' },
    ];

    const demoPosts = [
        {
            id: '1',
            author: { id: 'u1', name: 'Alice', institution: 'MGR Parent' },
            content: 'Bienvenue sur StudBud! 🎓',
            visibility: 'public' as const,
            createdAt: new Date().toISOString(),
        },
    ];

    return (
        <MainLayout>
            <Container size="sm" py="xl">
                <Stack gap="xl">
                    <div>
                        <Title order={2}>Composants Mantine (de base)</Title>
                        <Card withBorder mt="md" p="md">
                            <TextInput label="Exemple TextInput" placeholder="Votre texte" />
                            <Textarea label="Exemple Textarea" placeholder="Votre message" mt="md" />
                            <Button mt="md">Exemple Button</Button>
                        </Card>
                    </div>

                    <Divider label="Layout parts" labelPosition="center" />
                    <Header onInstitutionChange={() => { }} />
                    <Footer />

                    <Divider label="Composants personnalisés" labelPosition="center" />

                    <div>
                        <Title order={3} mb="sm">AuthButton</Title>
                        <AuthButton isAuthenticated={false} onLogin={() => { }} onLogout={() => { }} />
                    </div>

                    <div>
                        <Title order={3} mb="sm">LoginForm</Title>
                        <LoginForm loading={loading} onSubmit={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }} />
                    </div>

                    <div>
                        <Title order={3} mb="sm">PostForm</Title>
                        <PostForm loading={false} onSubmit={() => { }} />
                    </div>

                    <div>
                        <Title order={3} mb="sm">FeedList + PostCard</Title>
                        <FeedList posts={demoPosts} loading={false} />
                    </div>

                    <div>
                        <Title order={3} mb="sm">InstitutionSelector</Title>
                        <InstitutionSelector institutions={institutions} selectedId={institutions[0].id} onChange={() => { }} />
                    </div>

                    <div>
                        <Title order={3} mb="sm">LoaderOverlay</Title>
                        <div style={{ position: 'relative', minHeight: 80 }}>
                            <LoaderOverlay visible={loading} />
                            <Button onClick={() => setLoading((v) => !v)}>{loading ? 'Masquer' : 'Afficher'} le loader</Button>
                        </div>
                    </div>

                    <div>
                        <Title order={3} mb="sm">ErrorAlert</Title>
                        {error ? (
                            <ErrorAlert message={error} onClose={() => setError(null)} />
                        ) : (
                            <Button variant="light" onClick={() => setError('Une erreur de démonstration est survenue')}>Déclencher erreur</Button>
                        )}
                    </div>

                    <div>
                        <Title order={3} mb="sm">NotificationToast (placeholder)</Title>
                        <NotificationToast type="info" message="Ceci est une notification de démo" />
                    </div>
                </Stack>
            </Container>
        </MainLayout>
    );
};

export default ComponentsDemoPage;
