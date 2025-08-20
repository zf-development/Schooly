import React from 'react';
import { Group, Title, Container, UnstyledButton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import ThemeToggle from './ThemeToggle';
import type { AuthButtonProps } from '../types';

interface AppHeaderProps {
  authProps: AuthButtonProps;
}

const AppHeader: React.FC<AppHeaderProps> = ({ authProps }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/feed');
  };

  return (
    <div style={{ height: 60, borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%">
          <UnstyledButton onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <Title order={1} size="h3" c="academic">
              StudBud
            </Title>
          </UnstyledButton>

          <Group gap="lg">
            <ThemeToggle />

            <AuthButton {...authProps} />
          </Group>
        </Group>
      </Container>
    </div>
  );
};

export default AppHeader;
