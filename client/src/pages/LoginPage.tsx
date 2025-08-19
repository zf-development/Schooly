import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title, Paper, Container, Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';
import LoginForm from '../components/LoginForm';
import type { InstitutionOption, AuthButtonProps } from '../types';
import apiService from '../services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données de démonstration
  const demoInstitutions: InstitutionOption[] = [
    { id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c', name: 'MGR Parent' },
    { id: 'demo-institution-2', name: 'Cégep Édouard-Montpetit' }
  ];

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login({ email, password });

      if (response.success && response.data) {
        // Connexion réussie
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

  const handleInstitutionChange = (institutionId: string) => {
    // TODO: Gérer le changement d'institution
  };

  const authProps: AuthButtonProps = {
    isAuthenticated: false,
    onLogin: () => navigate('/login'),
    onLogout: () => {}
  };

  return (
    <MainLayout
      institutions={demoInstitutions}
      selectedInstitutionId={demoInstitutions[0].id}
      onInstitutionChange={handleInstitutionChange}
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
