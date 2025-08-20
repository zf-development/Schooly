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
    avatar_url: string;
}

interface UpdateProfileData {
    display_name?: string;
    avatar_url?: string;
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
}

export const userService = new UserService();
export default userService;


