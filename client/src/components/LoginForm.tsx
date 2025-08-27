import React, { useState } from 'react';
import {
    Button,
    PasswordInput,
    Stack,
    TextInput,
    Text,
    Divider,
    Group,
    Box
} from '@mantine/core';
import { IconMail, IconLock, IconLogin } from '@tabler/icons-react';
import styles from './LoginForm.module.css';

export interface LoginFormProps {
    onSubmit: (email: string, password: string) => void;
    loading: boolean;
}

const isValidEmail = (value: string): boolean => {
    // Simple validation RFC-like
    return /.+@.+\..+/.test(value);
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valid = isValidEmail(email);
        setEmailError(valid ? null : 'Veuillez entrer une adresse courriel valide');
        if (!valid) return;
        onSubmit(email, password);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        setEmail(value);
        if (emailError) {
            setEmailError(isValidEmail(value) ? null : 'Veuillez entrer une adresse courriel valide');
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Stack gap="xl">
                {/* En-tête du formulaire */}
                <Box ta="center" mb="md">
                    <Text size="lg" fw={600} c="white" mb="xs" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)' }}>
                        Bienvenue !
                    </Text>
                    <Text size="sm" c="rgba(255, 255, 255, 0.8)" style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)' }}>
                        Entrez vos identifiants pour continuer
                    </Text>
                </Box>

                {/* Champs du formulaire */}
                <Stack gap="lg">
                    <TextInput
                        label="Adresse email"
                        placeholder="vous@ecole.edu"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => setEmailError(isValidEmail(email) ? null : 'Veuillez entrer une adresse courriel valide')}
                        error={emailError}
                        required
                        leftSection={<IconMail size={16} color="rgba(255, 255, 255, 0.7)" />}
                        styles={{
                            input: {
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                '&:focus': {
                                    borderColor: 'rgba(255, 255, 255, 0.6)',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1)'
                                },
                                '&::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            },
                            label: {
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.9)',
                                marginBottom: '8px',
                                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                            },
                            error: {
                                color: '#ef4444',
                                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                                fontWeight: 600,
                                fontSize: '14px'
                            }
                        }}
                    />

                    <PasswordInput
                        label="Mot de passe"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        required
                        leftSection={<IconLock size={16} color="rgba(255, 255, 255, 0.7)" />}
                        styles={{
                            input: {
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                '&:focus': {
                                    borderColor: 'rgba(255, 255, 255, 0.6)',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1)'
                                },
                                '&::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.5)'
                                }
                            },
                            label: {
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.9)',
                                marginBottom: '8px',
                                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                            },
                            innerInput: {
                                borderRadius: '12px',
                                color: 'white'
                            },
                            visibilityToggle: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&:hover': {
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }
                            }
                        }}
                    />
                </Stack>

                {/* Bouton de connexion */}
                <Button
                    type="submit"
                    loading={loading}
                    leftSection={<IconLogin size={16} />}
                    size="md"
                    fullWidth
                    className={styles.loginButton}
                >
                    {loading ? 'Connexion...' : 'Se connecter'}
                </Button>

                {/* Informations supplémentaires */}
                <Box ta="center">
                    <Text size="xs" c="rgba(255, 255, 255, 0.6)" style={{ lineHeight: 1.4, textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}>
                        En vous connectant, vous acceptez nos conditions d'utilisation
                    </Text>
                </Box>
            </Stack>
        </form>
    );
};

export default LoginForm;
