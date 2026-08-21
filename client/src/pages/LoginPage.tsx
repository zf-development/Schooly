import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Stack,
    Title,
    Alert,
    Text,
    Box,
    Group,
    Center,
    Loader,
} from "@mantine/core";
import ThemeToggle from "../components/ThemeToggle";
import { IconAlertCircle, IconSchool } from "@tabler/icons-react";
import LoginForm from "../components/LoginForm";
import apiService from "../services/api";
import { useUserContext } from "../contexts/UserContext";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const userContext = useUserContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Vérification de sécurité pour éviter les erreurs pendant le hot reload
    if (!userContext) {
        return (
            <Center>
                <Loader color="violet" size="lg" />
            </Center>
        );
    }

    const { setUser } = userContext;

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.login({ email, password });

            if (response.success && response.data) {
                const userData = response.data.user;

                setUser({
                    id: userData.id,
                    email: userData.email,
                    name: userData.display_name || "Utilisateur",
                    avatar_url:
                        userData.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
                });

                navigate("/feed");
            } else {
                setError(response.error || "Email ou mot de passe incorrect");
            }
        } catch (err) {
            setError("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box>
                <ThemeToggle />
            </Box>

            <Box>
                <Stack gap="xl" align="center">
                    <Stack gap="sm" align="center" mb="lg">
                        <Box
                            style={{
                                background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "20px",
                                padding: "20px",
                                boxShadow:
                                    "0 8px 25px rgba(102, 126, 234, 0.3)",
                                marginBottom: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <IconSchool size={40} color="white" />
                        </Box>

                        <Title
                            order={1}
                            ta="center"
                            c="#1e293b"
                            fw={800}
                            size="2.5rem"
                            mb="16px"
                        >
                            Schooly
                        </Title>

                        <Text
                            size="md"
                            ta="center"
                            m="0"
                            lh={1.5}
                            c="#64748b"
                            fw={500}
                            mb="16px"
                        >
                            Connectez-vous à votre espace éducatif
                        </Text>
                    </Stack>

                    {/* Message d'erreur */}
                    {error && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            title="Erreur de connexion"
                            color="red"
                            variant="light"
                            style={{
                                width: "100%",
                                maxWidth: "400px",
                                borderRadius: "12px",
                                background: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                                border: "2px solid #dc2626",
                                boxShadow:
                                    "0 4px 20px rgba(220, 38, 38, 0.2)",
                            }}
                        >
                            <Text size="sm" c="#dc2626" fw={600}>
                                {error}
                            </Text>
                        </Alert>
                    )}

                    {/* Formulaire de connexion */}
                    <Box
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "32px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "16px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <LoginForm
                            onSubmit={handleLogin}
                            loading={loading}
                        />
                    </Box>

                    {/* Footer informatif */}
                    <Group
                        gap="xs"
                        style={{
                            color: "#64748b",
                            textAlign: "center",
                            marginTop: "32px",
                        }}
                    >
                        <Text size="xs">
                            © 2025 Schooly - Plateforme éducative
                        </Text>
                        <Text size="xs">•</Text>
                        <Text size="xs">Développé avec ❤️</Text>
                    </Group>
                </Stack>
            </Box>
        </Box>
    );
};

export default LoginPage;
