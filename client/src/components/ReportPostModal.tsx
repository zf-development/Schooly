import React, { useState } from "react";
import {
    Modal,
    Button,
    TextInput,
    Textarea,
    Select,
    Stack,
    Title,
    Text,
    Group,
    Alert,
    Skeleton,
} from "@mantine/core";
import { IconFlag, IconAlertCircle } from "@tabler/icons-react";

interface ReportPostModalProps {
    opened: boolean;
    onClose: () => void;
    postId: string;
    postTitle?: string;
}

const ReportPostModal: React.FC<ReportPostModalProps> = ({
    opened,
    onClose,
    postId,
    postTitle,
}) => {
    const [reason, setReason] = useState<string>("");
    const [details, setDetails] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const reportReasons = [
        { value: "inappropriate", label: "Contenu inapproprié" },
        { value: "spam", label: "Spam ou publicité" },
        { value: "harassment", label: "Harcèlement ou intimidation" },
        { value: "false_info", label: "Fausses informations" },
        { value: "copyright", label: "Violation de droits d'auteur" },
        { value: "other", label: "Autre raison" },
    ];

    const handleSubmit = async () => {
        if (!reason.trim()) return;

        setLoading(true);

        // Simuler l'envoi du signalement (placeholder)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSuccess(true);
        setLoading(false);

        // Fermer le modal après 2 secondes
        setTimeout(() => {
            onClose();
            setSuccess(false);
            setReason("");
            setDetails("");
        }, 2000);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            setReason("");
            setDetails("");
            setSuccess(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Signaler un post"
            size="md"
            closeOnClickOutside={!loading}
            closeOnEscape={!loading}
        >
            <Stack gap="lg">
                {postTitle && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title="Post concerné"
                        color="blue"
                        variant="light"
                    >
                        <Text size="sm">{postTitle}</Text>
                    </Alert>
                )}

                <Text size="sm" c="dimmed">
                    Aidez-nous à maintenir une communauté respectueuse en
                    signalant ce qui ne respecte pas nos règles.
                </Text>

                <Select
                    label="Raison du signalement"
                    placeholder="Choisissez une raison"
                    data={reportReasons}
                    value={reason}
                    onChange={(value) => setReason(value || "")}
                    required
                    disabled={loading}
                />

                <Textarea
                    label="Détails supplémentaires"
                    placeholder="Décrivez brièvement pourquoi vous signalez ce post..."
                    value={details}
                    onChange={(e) => setDetails(e.currentTarget.value)}
                    minRows={3}
                    maxRows={6}
                    disabled={loading}
                />

                {success && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title="Signalement envoyé"
                        color="green"
                        variant="light"
                    >
                        <Text size="sm">
                            Merci pour votre signalement. Notre équipe va
                            examiner ce contenu dans les plus brefs délais.
                        </Text>
                    </Alert>
                )}

                <Group justify="flex-end" gap="sm">
                    {loading ? (
                        <>
                            <Skeleton height={36} width={80} />
                            <Skeleton height={36} width={120} />
                        </>
                    ) : (
                        <>
                            <Button variant="light" onClick={handleClose}>
                                Annuler
                            </Button>
                            <Button
                                leftSection={<IconFlag size={16} />}
                                onClick={handleSubmit}
                                disabled={!reason.trim()}
                                color="red"
                            >
                                Signaler le post
                            </Button>
                        </>
                    )}
                </Group>
            </Stack>
        </Modal>
    );
};

export default ReportPostModal;
