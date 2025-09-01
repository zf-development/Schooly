// Types communs pour l'application Skolarae

// Plus besoin de InstitutionOption

export interface Post {
    id: string;
    title?: string;
    author: {
        id: string;
        name: string;
        display_name: string;
        avatar_url: string;
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
    onProfile?: () => void; // Navigation vers la page de profil
    userAvatar?: string; // Avatar de l'utilisateur connecté
    userName?: string; // Nom de l'utilisateur connecté
}

export interface PostFormProps {
    onSubmit: (title: string, content: string, visibility: 'public' | 'private') => void;
    loading: boolean;
    success?: boolean; // Indique si l'envoi précédent a réussi
}
