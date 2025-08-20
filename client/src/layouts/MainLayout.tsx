import React from 'react';
import { AppShell, Container } from '@mantine/core';
import AppHeader from '../components/Header';
import AppFooter from '../components/Footer';
import type { AuthButtonProps } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  authProps: AuthButtonProps;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
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
