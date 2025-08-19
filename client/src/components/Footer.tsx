import React from 'react';
import { Container, Text, Group, Anchor } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';

const AppFooter: React.FC = () => {
  return (
    <div style={{ height: 60, borderTop: '1px solid var(--mantine-color-gray-3)' }}>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%">
          <Text size="sm" c="dimmed">
            © 2024 StudBud. Fait avec <IconHeart size={14} style={{ color: 'red' }} /> pour les étudiants.
          </Text>
          <Group gap="md">
            <Anchor href="#" size="sm">À propos</Anchor>
            <Anchor href="#" size="sm">Confidentialité</Anchor>
            <Anchor href="#" size="sm">Contact</Anchor>
          </Group>
        </Group>
      </Container>
    </div>
  );
};

export default AppFooter;
