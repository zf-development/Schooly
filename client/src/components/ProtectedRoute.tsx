import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { Container, Stack, Title, Loader } from '@mantine/core';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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

    // Si pas d'utilisateur connecté, rediriger vers login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si connecté, afficher le contenu protégé
    return <>{children}</>;
};

export default ProtectedRoute;
