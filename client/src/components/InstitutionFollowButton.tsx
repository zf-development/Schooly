import React, { useState, useEffect } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconHeart, IconHeartOff } from '@tabler/icons-react';
import subscriptionService from '../services/subscriptionService';

interface InstitutionFollowButtonProps {
    institutionId: string;
    institutionName: string;
    onFollowChange?: (isFollowing: boolean) => void;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'light' | 'filled' | 'outline' | 'default' | 'subtle' | 'gradient';
}

const InstitutionFollowButton: React.FC<InstitutionFollowButtonProps> = ({
    institutionId,
    institutionName,
    onFollowChange,
    size = 'sm',
    variant = 'light'
}) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        checkFollowStatus();
    }, [institutionId]);

    const checkFollowStatus = async () => {
        try {
            const following = await subscriptionService.isFollowing(institutionId);
            setIsFollowing(following);
            setInitialized(true);
        } catch (error) {
            console.error('Erreur lors de la vérification du statut de suivi:', error);
            setInitialized(true);
        }
    };

    const handleFollowToggle = async () => {
        if (loading) return;

        setLoading(true);
        try {
            if (isFollowing) {
                // Désuivre
                const response = await subscriptionService.unfollow(institutionId);
                if (response.success) {
                    setIsFollowing(false);
                    onFollowChange?.(false);
                } else {
                    console.error('Erreur lors du désabonnement:', response.error);
                }
            } else {
                // Suivre
                const response = await subscriptionService.follow(institutionId);
                if (response.success) {
                    setIsFollowing(true);
                    onFollowChange?.(true);
                } else {
                    console.error('Erreur lors de l\'abonnement:', response.error);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la modification du suivi:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        return (
            <Button
                size={size}
                variant={variant}
                loading={true}
                disabled
            >
                Chargement...
            </Button>
        );
    }

    return (
        <Button
            size={size}
            variant={variant}
            color={isFollowing ? 'red' : 'blue'}
            leftSection={
                isFollowing ? (
                    <IconHeartOff size={16} />
                ) : (
                    <IconHeart size={16} />
                )
            }
            onClick={handleFollowToggle}
            loading={loading}
            title={
                isFollowing
                    ? `Ne plus suivre ${institutionName}`
                    : `Suivre ${institutionName}`
            }
        >
            <Group gap="xs">
                {isFollowing ? (
                    <>
                        <Text size="sm">Ne plus suivre</Text>
                    </>
                ) : (
                    <>
                        <Text size="sm">Suivre</Text>
                    </>
                )}
            </Group>
        </Button>
    );
};

export default InstitutionFollowButton;


