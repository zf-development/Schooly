import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  Title,
  Paper,
  Container,
  Alert,
  Text,
  Box,
  Group
} from '@mantine/core';
import ThemeToggle from '../components/ThemeToggle';
import { IconAlertCircle, IconSchool, IconBrandGithub } from '@tabler/icons-react';
import LoginForm from '../components/LoginForm';
import type { AuthButtonProps } from '../types';
import apiService from '../services/api';
import { useUserContext } from '../contexts/UserContext';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Box className={styles.loginPage}>
      {/* ThemeToggle flottant en haut à droite */}
      <Box
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1000,
          animation: 'themeToggleSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both'
        }}
      >
        <ThemeToggle />
      </Box>

      {/* Contenu principal centré avec effet glass */}
      <Container size="sm" style={{ width: '100%' }}>
        <Box className={styles.glassContainer}>
          <Stack gap="xl" align="center">
            {/* Logo et titre */}
            <Stack gap="sm" align="center" mb="lg">
              <Box
                className={styles.logoContainer}
                style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <IconSchool size={40} color="white" />
              </Box>

              <Title
                order={1}
                ta="center"
                className={styles.title}
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  margin: 0
                }}
              >
                StudBud
              </Title>

              <Text
                size="md"
                ta="center"
                className={styles.subtitle}
                style={{
                  fontWeight: 500,
                  maxWidth: '300px'
                }}
              >
                Connectez-vous à votre espace éducatif
              </Text>
            </Stack>

            {/* Message d'erreur */}
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Erreur de connexion"
                color="red"
                variant="light"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid #dc2626',
                  boxShadow: '0 4px 20px rgba(220, 38, 38, 0.2)'
                }}
              >
                <Text size="sm" c="#dc2626" fw={600}>{error}</Text>
              </Alert>
            )}

            {/* Formulaire de connexion */}
            <Box
              className={styles.formContainer}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '32px'
              }}
            >
              <LoginForm onSubmit={handleLogin} loading={loading} />
            </Box>

            {/* Footer informatif */}
            <Group gap="xs" size="sm" className={styles.footer}>
              <Text size="xs">
                © 2025 StudBud - Plateforme éducative
              </Text>
              <Text size="xs">
                •
              </Text>
              <Text size="xs">
                Développé avec ❤️
              </Text>
            </Group>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
