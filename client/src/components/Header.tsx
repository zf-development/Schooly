import React from 'react';
import { Group, Title, Container } from '@mantine/core';
import InstitutionSelector from './InstitutionSelector';
import { AuthButton } from './AuthButton';
import type { InstitutionOption, AuthButtonProps } from '../types';

interface AppHeaderProps {
  onInstitutionChange: (id: string) => void;
  institutions: InstitutionOption[];
  selectedInstitutionId: string;
  authProps: AuthButtonProps;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  onInstitutionChange,
  institutions,
  selectedInstitutionId,
  authProps
}) => {
  return (
    <div style={{ height: 60, borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%">
          <Title order={1} size="h3" c="academic">
            StudBud
          </Title>

          <Group gap="lg">
            <InstitutionSelector
              institutions={institutions}
              selectedId={selectedInstitutionId}
              onChange={onInstitutionChange}
            />

            <AuthButton {...authProps} />
          </Group>
        </Group>
      </Container>
    </div>
  );
};

export default AppHeader;
