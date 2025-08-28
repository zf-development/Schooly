import React, { useState, useCallback } from "react";
import {
    Code,
    Divider,
    Group,
    Stack,
    Text,
    Tooltip,
    ActionIcon,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { useNavbarContext } from "../contexts/NavbarContext";
import styles from "./AppNavbar.module.css";
import {
    IconSchool,
    IconUser,
    IconLogout,
    IconHome,
    IconNote,
    IconCalendar,
    IconFile,
    IconBuilding,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";

const linksSections = {
    feed: {
        label: "Social",
        links: [{ route: "/feed", label: "Fil d'actualités", icon: IconHome }],
    },
    academic: {
        label: "Académique",
        links: [
            { route: "/notes", label: "Mes notes", icon: IconNote },
            { route: "/calendar", label: "Mon calendrier", icon: IconCalendar },
            { route: "/files", label: "Mes fichiers", icon: IconFile },
        ],
    },
    account: {
        label: "Mon compte",
        links: [
            { route: "/profile", label: "Mon profil", icon: IconUser },
            {
                route: "/subscriptions",
                label: "Mes établissements",
                icon: IconBuilding,
            },
            { route: "/logout", label: "Se déconnecter", icon: IconLogout },
        ],
    },
};

const AppNavbar = React.memo(() => {
    const navigate = useNavigate();
    const { logout } = useUserContext();
    const { isOpen, toggleNavbar } = useNavbarContext();

    const handleNavigation = useCallback(
        async (route: string) => {
            if (route === "/logout") {
                try {
                    await logout();
                    return;
                } catch (error) {
                    console.error("Erreur lors de la déconnexion:", error);
                }
            }
            navigate(route);
        },
        [logout, navigate]
    );

    const renderSection = (sectionKey: string, sectionData: any) =>
        isOpen ? (
            <div key={sectionKey} className={styles.section}>
                <Text
                    size="xs"
                    fw={400}
                    lts={1.25}
                    ta="center"
                    c="#a2a2a2"
                    mt="xs"
                    mb="md"
                    className={styles.sectionLabel}
                >
                    {sectionData.label}
                </Text>
                <Divider />
                {sectionData.links.map((item: any, index: number) => (
                    <div
                        key={index}
                        className={styles.link}
                        onClick={() => handleNavigation(item.route)}
                    >
                        <item.icon className={styles.linkIcon} stroke={1.5} />
                        <span className={styles.linkText}>{item.label}</span>
                    </div>
                ))}
            </div>
        ) : (
            <div key={sectionKey} className={styles.section}>
                {sectionData.links.map((item: any, index: number) => (
                    <Tooltip
                        key={index}
                        label={item.label}
                        position="right"
                        withArrow
                        openDelay={150}
                    >
                        <div
                            className={styles.link}
                            onClick={() => handleNavigation(item.route)}
                        >
                            <item.icon
                                className={styles.linkIcon}
                                stroke={1.5}
                            />
                        </div>
                    </Tooltip>
                ))}
            </div>
        );

    return (
        <>
            {/* Bouton de toggle flottant */}
            <div
                className={`${styles.toggleButton} ${
                    isOpen ? styles.toggleOpen : styles.toggleClosed
                }`}
            >
                <Tooltip
                    label={isOpen ? "Réduire le menu" : "Étendre le menu"}
                    position="right"
                    withArrow
                >
                    <ActionIcon
                        variant="light"
                        size="lg"
                        onClick={toggleNavbar}
                        className={styles.toggleIcon}
                    >
                        {isOpen ? (
                            <IconChevronLeft size={20} />
                        ) : (
                            <IconChevronRight size={20} />
                        )}
                    </ActionIcon>
                </Tooltip>
            </div>

            {isOpen ? (
                <nav className={styles.navbar}>
                    <div className={styles.navbarMain}>
                        <Group
                            className={styles.header}
                            justify="center"
                            gap="xs"
                        >
                            <Group className={styles.logoGroup}>
                                <IconSchool size={28} />
                                <Text
                                    size="lg"
                                    fw={700}
                                    lh={1}
                                    className={styles.logoText}
                                >
                                    Skolarae
                                </Text>
                            </Group>

                            <Group className={styles.versionGroup}>
                                <Code>v1.0.0</Code>
                            </Group>
                        </Group>

                        <Stack justify="space-between" gap="xl">
                            {renderSection("feed", linksSections.feed)}
                            {renderSection("academic", linksSections.academic)}
                        </Stack>
                    </div>

                    <div className={styles.footer}>
                        {renderSection("account", linksSections.account)}
                    </div>
                </nav>
            ) : (
                <nav className={styles.navbarClosed}>
                    <div className={styles.navbarMain}>
                        <Group
                            className={styles.header}
                            justify="center"
                            gap="xs"
                        >
                            <Tooltip
                                label="Skolarae"
                                position="right"
                                withArrow
                                openDelay={500}
                            >
                                <Group>
                                    <IconSchool size={28} />
                                </Group>
                            </Tooltip>
                        </Group>

                        <Stack justify="space-between" gap="xl">
                            {renderSection("feed", linksSections.feed)}
                            {renderSection("academic", linksSections.academic)}
                        </Stack>
                    </div>

                    <div className={styles.footer}>
                        {renderSection("account", linksSections.account)}
                    </div>
                </nav>
            )}
        </>
    );
});

AppNavbar.displayName = "AppNavbar";

export default AppNavbar;
