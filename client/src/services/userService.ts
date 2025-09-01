// Service pour gérer les utilisateurs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface UserProfile {
    id: string;
    email: string;
    institution_id: string;
    display_name: string;
    full_name?: string;
    avatar_url: string;
    inscription_date?: string;
    file_number?: string;
    school?: string;
    group_number?: string;
    education_level?: string;
    posts_count?: number;
    xp_points?: number;
    preferred_tags?: string[];
    academic_projects?: string[];
}

interface UpdateProfileData {
    display_name?: string;
    avatar_url?: string;
    full_name?: string;
    school?: string;
    group_number?: string;
    education_level?: string;
    preferred_tags?: string[];
    academic_projects?: string[];
}

class UserService {
    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const token = this.getAuthToken();

            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            if (options.headers) {
                Object.assign(headers, options.headers);
            }

            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue',
            };
        }
    }

    // Récupérer le profil de l'utilisateur connecté
    async getMe(): Promise<ApiResponse<UserProfile>> {
        return this.request<UserProfile>('/users/me');
    }

    // Mettre à jour le profil de l'utilisateur connecté
    async updateMe(profileData: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
        return this.request<UserProfile>('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(profileData),
        });
    }

    // Upload d'un avatar
    async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${API_BASE_URL}/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'avatar',
            };
        }
    }

    // Récupérer les statistiques de l'utilisateur
    async getUserStats(): Promise<ApiResponse<{
        posts_count: number;
        xp_points: number;
        level: number;
        progress_to_next_level: number;
    }>> {
        return this.request('/users/stats');
    }

    // Récupérer les badges de l'utilisateur
    async getUserBadges(): Promise<ApiResponse<Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        unlocked: boolean;
        unlocked_at?: string;
    }>>> {
        return this.request('/users/badges');
    }
}

export const userService = new UserService();
export default userService;


