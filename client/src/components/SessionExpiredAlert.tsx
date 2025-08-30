import React from "react";
import { Alert, Button, Group, Text, Stack } from "@mantine/core";
import { IconAlertCircle, IconX } from "@tabler/icons-react";
import { useUserContext } from "../contexts/UserContext";

interface SessionExpiredAlertProps {
    className?: string;
}

const SessionExpiredAlert: React.FC<SessionExpiredAlertProps> = ({
    className = "",
}) => {
    const { isTokenExpired, forceLogout } = useUserContext();

    if (!isTokenExpired) {
        return null;
    }

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
            <Alert
                variant="light"
                color="red"
                title={
                    <Group justify="space-between" align="center">
                        <Group gap="xs">
                            <IconAlertCircle size={20} />
                            <Text fw={600}>Session expirée</Text>
                        </Group>
                        <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            onClick={forceLogout}
                            leftSection={<IconX size={16} />}
                        >
                            Fermer
                        </Button>
                    </Group>
                }
                withCloseButton={false}
            >
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                        Votre session a expiré. Vous allez être redirigé vers la
                        page de connexion.
                    </Text>
                    <Button
                        variant="filled"
                        color="red"
                        size="sm"
                        onClick={forceLogout}
                        fullWidth
                    >
                        Se reconnecter maintenant
                    </Button>
                </Stack>
            </Alert>
        </div>
    );
};

export default SessionExpiredAlert;
