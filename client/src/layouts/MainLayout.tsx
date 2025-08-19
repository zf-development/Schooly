import React from 'react';
import { AppShell, Container } from '@mantine/core';
import AppHeader from '../components/Header';
import AppFooter from '../components/Footer';
import type { InstitutionOption, AuthButtonProps } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  institutions: InstitutionOption[];
  selectedInstitutionId: string;
  onInstitutionChange: (id: string) => void;
  authProps: AuthButtonProps;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  institutions,
  selectedInstitutionId,
  onInstitutionChange,
  authProps
}) => {
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader
          onInstitutionChange={onInstitutionChange}
          institutions={institutions}
          selectedInstitutionId={selectedInstitutionId}
          authProps={authProps}
        />
      </AppShell.Header>

      <AppShell.Main style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Container size="lg" py="xl">
          {children}
        </Container>
      </AppShell.Main>

      <AppShell.Footer>
        <AppFooter />
      </AppShell.Footer>
    </AppShell>
  );
};

export default MainLayout;
