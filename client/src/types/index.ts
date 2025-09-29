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
    files?: any[];
    hashtags?: string[];
    likes?: number;
    comments?: number;
    hasLiked?: boolean;
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
    onSubmit: (title: string, content: string, visibility: 'public' | 'private', files?: File[]) => void;
    loading: boolean;
    success?: boolean; // Indique si l'envoi précédent a réussi
}

export interface CalendarEvent {
    id?: string;
    title: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    location?: string;
    attendees?: string[];
    type: 'academic' | 'personal' | 'institution';
    reminder?: boolean;
    created_by: string;
    created_at: Date;
}
