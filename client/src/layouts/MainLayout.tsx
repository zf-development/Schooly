import React from "react";
import { AppShell, Container } from "@mantine/core";
import type { AuthButtonProps } from "../types";
import AppNavbar from "../components/AppNavbar";
import SessionExpiredAlert from "../components/SessionExpiredAlert";
import { useNavbarContext } from "../contexts/NavbarContext";

interface MainLayoutProps {
    children: React.ReactNode;
    authProps: AuthButtonProps;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, authProps }) => {
    const { isOpen } = useNavbarContext();

    return (
        <>
            {/* Alerte de session expirée */}
            <SessionExpiredAlert />

            <AppShell
                padding="md"
                navbar={{
                    width: isOpen ? 280 : 90,
                    breakpoint: "sm",
                }}
            >
                {/* Navbar persistante - isolée du cycle de rendu des pages */}
                <AppShell.Navbar>
                    <AppNavbar />
                </AppShell.Navbar>

                {/* Contenu principal qui change selon la route */}
                <AppShell.Main>
                    <Container size="lg" py="xl">
                        {children}
                    </Container>
                </AppShell.Main>
            </AppShell>
        </>
    );
};

export default MainLayout;
