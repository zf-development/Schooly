// TODO: Formulaire de création de post
// - Saisie du contenu + sélection de visibilité

import React, { useState, useEffect } from 'react';
import { Button, Stack, Textarea, SegmentedControl, TextInput } from '@mantine/core';
import type { PostFormProps } from '../types';

const PostForm: React.FC<PostFormProps> = ({ onSubmit, loading, success = false }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');

    // Vider le formulaire seulement si l'envoi précédent a réussi
    useEffect(() => {
        if (success && !loading) {
            // Réinitialiser les champs seulement en cas de succès
            setTitle('');
            setContent('');
            setVisibility('public');
        }
    }, [success, loading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(title, content, visibility);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack>
                <TextInput
                    label="Titre"
                    placeholder="Titre de votre post..."
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    required
                />
                <Textarea
                    label="Votre message"
                    placeholder="Partagez une info..."
                    value={content}
                    onChange={(e) => setContent(e.currentTarget.value)}
                    minRows={3}
                    required
                />
                <SegmentedControl
                    value={visibility}
                    onChange={(v) => setVisibility(v as 'public' | 'private')}
                    data={[{ label: 'Public', value: 'public' }, { label: 'Privé', value: 'private' }]}
                />
                <Button type="submit" loading={loading}>Publier</Button>
            </Stack>
        </form>
    );
};

export default PostForm;
