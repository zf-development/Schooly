// Types communs pour l'application StudBud

export interface InstitutionOption {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        institution: string;
    };
    content: string;
    visibility: 'public' | 'private';
    createdAt: string | Date;
}

export interface AuthButtonProps {
    isAuthenticated: boolean;
    onLogin: () => void;
    onLogout: () => void;
}

export interface PostFormProps {
    onSubmit: (title: string, content: string, visibility: 'public' | 'private') => void;
    loading: boolean;
    success?: boolean; // Indique si l'envoi précédent a réussi
}
