import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title, Paper, Container, Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';
import LoginForm from '../components/LoginForm';
import type { AuthButtonProps } from '../types';
import apiService from '../services/api';
import { useUserContext } from '../contexts/UserContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Plus besoin de données de démonstration pour les institutions

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login({ email, password });

      if (response.success && response.data) {
        // Connexion réussie - mettre à jour le contexte utilisateur
        const userData = response.data.user;
        console.log('Données utilisateur reçues:', userData); // Debug

        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.display_name || 'Utilisateur',
          avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`
        });

        // Rediriger vers le feed
        navigate('/feed');
      } else {
        setError(response.error || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Plus besoin de gérer le changement d'institution

  const authProps: AuthButtonProps = {
    isAuthenticated: false,
    onLogin: () => navigate('/login'),
    onLogout: () => { },
    onProfile: () => navigate('/profile')
  };

  return (
    <MainLayout
      authProps={authProps}
    >
      <Container size="sm" py="xl">
        <Stack gap="xl" align="center">
          <Title order={1} ta="center" c="academic">
            Connexion à StudBud
          </Title>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red" variant="light">
              <Text size="sm">{error}</Text>
            </Alert>
          )}

          <Paper p="xl" withBorder style={{ width: '100%', maxWidth: 400 }}>
            <LoginForm onSubmit={handleLogin} loading={loading} />
          </Paper>
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default LoginPage;
