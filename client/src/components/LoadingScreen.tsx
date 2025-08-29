import React from "react";
import {
    Container,
    Stack,
    Title,
    Text,
    Center,
    Loader,
    Box,
} from "@mantine/core";
import { IconLoader } from "@tabler/icons-react";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
    title?: string;
    description?: string;
    showIcon?: boolean;
    size?: "sm" | "md" | "lg";
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    title = "Chargement en cours...",
    description = "Veuillez patienter pendant que nous préparons votre contenu",
    showIcon = true,
    size = "md",
}) => {
    const getContainerSize = () => {
        switch (size) {
            case "sm":
                return "xs";
            case "lg":
                return "lg";
            default:
                return "md";
        }
    };

    const getIconSize = () => {
        switch (size) {
            case "sm":
                return 40;
            case "lg":
                return 80;
            default:
                return 60;
        }
    };

    const getTitleSize = () => {
        switch (size) {
            case "sm":
                return "h4";
            case "lg":
                return "h1";
            default:
                return "h2";
        }
    };

    return (
        <Container
            size={getContainerSize()}
            py="xl"
            className={styles.loadingContainer}
        >
            <Center style={{ minHeight: "50vh" }}>
                <Stack gap="xl" align="center" ta="center">
                    {/* Icône de chargement animée */}
                    {showIcon && (
                        <Box className={styles.loadingIcon}>
                            <IconLoader
                                size={getIconSize()}
                                color="var(--mantine-color-blue-6)"
                                className={styles.spinningIcon}
                            />
                        </Box>
                    )}

                    {/* Titre principal */}
                    <Title order={1} c="dark.8" size={getTitleSize()}>
                        {title}
                    </Title>

                    {/* Description */}
                    <Text size="lg" c="dimmed" maw={400}>
                        {description}
                    </Text>

                    {/* Loader avec texte */}
                    <Stack
                        gap="md"
                        align="center"
                        className={styles.loaderContainer}
                    >
                        <Loader size="md" color="blue" />
                        <Text size="sm" c="dimmed" fw={500}>
                            Chargement...
                        </Text>
                    </Stack>
                </Stack>
            </Center>
        </Container>
    );
};

export default LoadingScreen;
