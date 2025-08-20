import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { Container, Stack, Title, Loader } from '@mantine/core';

interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { user, isLoading } = useUserContext();

    // Afficher un loader pendant la vérification
    if (isLoading) {
        return (
            <Container size="md" py="xl">
                <Stack gap="xl" align="center">
                    <Title order={1} ta="center" c="academic">
                        Vérification de l'authentification...
                    </Title>
                    <Loader size="lg" />
                </Stack>
            </Container>
        );
    }

    // Si utilisateur connecté, rediriger vers le feed
    if (user) {
        return <Navigate to="/feed" replace />;
    }

    // Si pas connecté, afficher la page publique (login)
    return <>{children}</>;
};

export default PublicRoute;
