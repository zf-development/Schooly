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

export interface Page {
    id: string;
    title: string;
    content?: any; // Contenu Editor.js (null pour les dossiers)
    parent_id?: string | null; // ID du dossier parent
    user_id: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    type: 'page' | 'folder';
    order_index?: number; // Index pour l'ordre des éléments
    children?: Page[]; // Enfants du dossier (calculé côté client)
}