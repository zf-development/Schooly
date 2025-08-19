// TODO: Page de connexion
// - Afficher un formulaire de connexion (LoginForm)
// - Gérer un état loading local et affichage d'une erreur claire
// - Aucune logique d'auth réelle ici (sera branchée à Supabase plus tard)

import React, { useState } from 'react';
import { Container, Paper, Title, Stack } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';
import { LoginForm, ErrorAlert } from '../components';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            // TODO: Appeler Supabase auth (signIn) ici
            // Placeholder demo
            await new Promise((r) => setTimeout(r, 600));
            navigate('/feed');
        } catch (e) {
            setError("Impossible de se connecter (démo).");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <Container size="xs" py="xl">
                <Paper withBorder p="xl" radius="md">
                    <Stack>
                        <Title order={2}>Connexion</Title>
                        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
                        <LoginForm loading={loading} onSubmit={handleSubmit} />
                    </Stack>
                </Paper>
            </Container>
        </MainLayout>
    );
};

export default LoginPage;
