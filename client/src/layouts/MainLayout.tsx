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
            <SessionExpiredAlert />

            <AppShell
                padding="md"
                navbar={{
                    width: isOpen ? 280 : 90,
                    breakpoint: "sm",
                }}
            >
                <AppShell.Navbar>
                    <AppNavbar />
                </AppShell.Navbar>

                <AppShell.Main>
                    <Container fluid py="xl">
                        {children}
                    </Container>
                </AppShell.Main>
            </AppShell>
        </>
    );
};

export default MainLayout;
