// TODO: Formulaire de connexion
// - Soumet email + password via onSubmit
// - Afficher un loader si loading = true

import React, { useState } from 'react';
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';

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
            <Stack gap="md">
                <TextInput
                    label="Email"
                    placeholder="vous@ecole.edu"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => setEmailError(isValidEmail(email) ? null : 'Veuillez entrer une adresse courriel valide')}
                    error={emailError}
                    required
                />
                <PasswordInput
                    label="Mot de passe"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    required
                />
                <Button type="submit" loading={loading}>Se connecter</Button>
            </Stack>
        </form>
    );
};

export default LoginForm;
