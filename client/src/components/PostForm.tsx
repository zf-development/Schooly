// TODO: Formulaire de création de post
// - Saisie du contenu + sélection de visibilité

import React, { useState } from 'react';
import { Button, Stack, Textarea, SegmentedControl } from '@mantine/core';

export interface PostFormProps {
    onSubmit: (content: string, visibility: 'public' | 'private') => void;
    loading: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit, loading }) => {
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Validation minimale
        onSubmit(content, visibility);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack>
                <Textarea label="Votre message" placeholder="Partagez une info..." value={content} onChange={(e) => setContent(e.currentTarget.value)} minRows={3} required />
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
