import React, { useCallback } from "react";
import {
    Code,
    Divider,
    Group,
    Stack,
    Text,
    Tooltip,
    ActionIcon,
    Badge,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { useNavbarContext } from "../contexts/NavbarContext";
import styles from "./AppNavbar.module.css";
import {
    IconSchool,
    IconUserScan,
    IconLogout,
    IconHome,
    IconNews,
    IconNotes,
    IconCalendar,
    IconCloud,
    IconBuilding,
    IconBuildingPlus,
    IconChevronLeft,
    IconChevronRight,
    IconMessage,
    IconUpload,
    IconUsers,
    IconBook,
    IconChartLine,
    IconBrain,
} from "@tabler/icons-react";

const linksSections = {
    feed: {
        label: "Social",
        links: [
            { route: "/feed", label: "Fil d'actualités", icon: IconNews },
            {
                route: "/subscriptions",
                label: "Mes abonnements",
                icon: IconBuildingPlus,
            },
            { route: "/messaging", label: "Messagerie", icon: IconMessage, badge: "WIP" },
        ],
    },
    academic: {
        label: "Académique",
        links: [
            { route: "/notes", label: "Mes notes", icon: IconNotes },
            { route: "/my-session", label: "Ma session", icon: IconChartLine, badge: "WIP" },
            { route: "/calendar", label: "Mon calendrier", icon: IconCalendar },
            { route: "/files", label: "Mes fichiers", icon: IconCloud },
            { route: "/homework", label: "Devoirs", icon: IconUpload, badge: "WIP" },
            { route: "/projects", label: "Projets", icon: IconUsers, badge: "WIP" },
            { route: "/course-notes", label: "Notes de cours", icon: IconBook, badge: "WIP" },
            { route: "/quizzes", label: "Quiz", icon: IconBrain, badge: "WIP" },
        ],
    },
    account: {
        label: "Mon compte",
        links: [
            { route: "/profile", label: "Mon profil", icon: IconUserScan },

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
                    mt={0}
                    mb="xs"
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
                        <Group justify="space-between" style={{ flex: 1 }}>
                            <span className={styles.linkText}>{item.label}</span>
                            {item.badge && (
                                <Badge size="xs" color="orange" variant="light">
                                    {item.badge}
                                </Badge>
                            )}
                        </Group>
                    </div>
                ))}
            </div>
        ) : (
            <div key={sectionKey} className={styles.section}>
                {sectionData.links.map((item: any, index: number) => (
                    <Tooltip
                        key={index}
                        label={
                            <Group gap="xs">
                                <Text>{item.label}</Text>
                                {item.badge && (
                                    <Badge size="xs" color="orange" variant="light">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Group>
                        }
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
                    {/* Header sticky en haut */}
                    <div className={styles.headerSticky}>
                        <Group
                            className={styles.header}
                            justify="center"
                            gap="xs"
                        >
                            <Group className={styles.logoGroup}>
                                <IconSchool size={32} color="#8b5cf6" />
                                <Text
                                    c="#8b5cf6"
                                    size="xl"
                                    fw={800}
                                    lh={1}
                                    className={styles.logoText}
                                >
                                    Skolarae
                                </Text>
                            </Group>

                            <Group className={styles.versionGroup}>
                                <Code style={{ fontSize: "10px" }}>M.V.P</Code>
                            </Group>
                        </Group>
                    </div>

                    {/* Contenu scrollable au milieu */}
                    <div className={styles.navbarScrollable}>
                        <Stack justify="flex-start" gap="xl">
                            {renderSection("feed", linksSections.feed)}
                            {renderSection("academic", linksSections.academic)}
                        </Stack>
                    </div>

                    {/* Footer sticky en bas */}
                    <div className={styles.footerSticky}>
                        {renderSection("account", linksSections.account)}
                    </div>
                </nav>
            ) : (
                <nav className={styles.navbarClosed}>
                    {/* Header sticky en haut */}
                    <div className={styles.headerSticky}>
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
                                    <IconSchool size={32} color="#8b5cf6" />
                                </Group>
                            </Tooltip>
                        </Group>
                    </div>

                    {/* Contenu scrollable au milieu */}
                    <div className={styles.navbarScrollable}>
                        <Stack justify="flex-start" gap="xl">
                            {renderSection("feed", linksSections.feed)}
                            {renderSection("academic", linksSections.academic)}
                        </Stack>
                    </div>

                    {/* Footer sticky en bas */}
                    <div className={styles.footerSticky}>
                        {renderSection("account", linksSections.account)}
                    </div>
                </nav>
            )}
        </>
    );
});

AppNavbar.displayName = "AppNavbar";

export default AppNavbar;
