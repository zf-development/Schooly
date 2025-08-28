import React, { useState } from 'react';
import {
    Button,
    PasswordInput,
    Stack,
    TextInput,
    Text,
    Box
} from '@mantine/core';
import { IconMail, IconLock, IconLogin } from '@tabler/icons-react';

export interface LoginFormProps {
    onSubmit: (email: string, password: string) => void;
    loading: boolean;
}

const isValidEmail = (value: string): boolean => {
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
                <Box ta="center" mb="md">
                    <Text size="lg" fw={600} mb="xs">
                        Bienvenue !
                    </Text>
                    <Text size="sm">
                        Entrez vos identifiants pour continuer
                    </Text>
                </Box>

                <Stack gap="sm">
                    <TextInput
                        label="Adresse email"
                        placeholder="vous@ecole.edu"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => setEmailError(isValidEmail(email) ? null : 'Veuillez entrer une adresse courriel valide')}
                        error={emailError}
                        required
                        leftSection={<IconMail size={16} />}
                    />

                    <PasswordInput
                        label="Mot de passe"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        required
                        leftSection={<IconLock size={16} />}
                    />
                </Stack>

                <Button
                    type="submit"
                    loading={loading}
                    leftSection={<IconLogin size={16} />}
                    size="md"
                    fullWidth
                >
                    {loading ? 'Connexion...' : 'Se connecter'}
                </Button>

                <Box ta="center">
                    <Text size="xs" lh={1.4}>
                        En vous connectant, vous acceptez nos conditions d'utilisation
                    </Text>
                </Box>
            </Stack>
        </form >
    );
};

export default LoginForm;
