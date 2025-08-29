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
import { IconShieldCheck, IconUserCheck } from "@tabler/icons-react";
import styles from "./AuthVerificationScreen.module.css";

interface AuthVerificationScreenProps {
    type: "protected" | "public";
}

const AuthVerificationScreen: React.FC<AuthVerificationScreenProps> = ({
    type,
}) => {
    const isProtected = type === "protected";

    return (
        <Container size="sm" py="xl" className={styles.verificationContainer}>
            <Center style={{ minHeight: "60vh" }}>
                <Stack gap="xl" align="center" ta="center">
                    {/* Icône animée */}
                    <Box className={styles.verificationIcon}>
                        {isProtected ? (
                            <IconShieldCheck
                                size={80}
                                color="var(--mantine-color-blue-6)"
                            />
                        ) : (
                            <IconUserCheck
                                size={80}
                                color="var(--mantine-color-green-6)"
                            />
                        )}
                    </Box>

                    {/* Titre principal */}
                    <Title order={1} c="dark.8" size="h2">
                        {isProtected
                            ? "Vérification de l'accès"
                            : "Vérification de l'authentification"}
                    </Title>

                    {/* Description */}
                    <Text size="lg" c="dimmed" maw={400}>
                        {isProtected
                            ? "Nous vérifions vos permissions pour accéder à cette page..."
                            : "Nous vérifions votre statut de connexion..."}
                    </Text>

                    {/* Loader avec texte */}
                    <Stack
                        gap="md"
                        align="center"
                        className={styles.loaderContainer}
                    >
                        <Loader size="lg" color="blue" />
                        <Text size="sm" c="dimmed" fw={500}>
                            Veuillez patienter...
                        </Text>
                    </Stack>

                    {/* Informations supplémentaires */}
                    <Box
                        p="md"
                        style={{
                            background: "var(--mantine-color-gray-0)",
                            borderRadius: "var(--mantine-radius-md)",
                            border: "1px solid var(--mantine-color-gray-2)",
                        }}
                    >
                        <Text size="sm" c="dimmed">
                            {isProtected
                                ? "Cette page nécessite une connexion pour être accessible"
                                : "Redirection automatique en cours..."}
                        </Text>
                    </Box>
                </Stack>
            </Center>
        </Container>
    );
};

export default AuthVerificationScreen;
