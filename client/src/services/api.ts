// Service API pour communiquer avec le backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class ApiService {
    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private setAuthToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    private removeAuthToken(): void {
        localStorage.removeItem('authToken');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const token = this.getAuthToken();

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Ajouter le token d'authentification si disponible
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Fusionner avec les headers optionnels
            if (options.headers) {
                Object.assign(headers, options.headers);
            }

            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    // Si on a un token et qu'on reçoit 401, c'est une session expirée
                    if (token) {
                        this.removeAuthToken();
                        throw new Error('Session expirée. Veuillez vous reconnecter.');
                    } else {
                        // Pas de token = erreur d'authentification, afficher le vrai message
                        throw new Error(errorData.message || errorData.error || 'Identifiants invalides');
                    }
                }

                throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
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

    // Posts
    async getPosts(): Promise<ApiResponse<any[]>> {
        return this.request('/feed');
    }

    async createPost(postData: { title: string; content: string; visibility: 'public' | 'private' }): Promise<ApiResponse<any>> {
        return this.request('/feed', {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    }

    async updatePost(postId: string, postData: { content: string; visibility: 'public' | 'private' }): Promise<ApiResponse<any>> {
        return this.request(`/feed/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(postData),
        });
    }

    async deletePost(postId: string): Promise<ApiResponse<any>> {
        return this.request(`/feed/${postId}`, {
            method: 'DELETE',
        });
    }

    // Auth
    async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Afficher le message d'erreur spécifique du backend
                const errorMessage = errorData.error || errorData.message || `Erreur ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Stocker le token si la connexion réussit
            if (data.token) {
                this.setAuthToken(data.token);
            } else if (data.access_token) {
                this.setAuthToken(data.access_token);
            }

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue',
            };
        }
    }

    async getCurrentUser(): Promise<ApiResponse<any>> {
        return this.request('/auth/me');
    }

    logout(): void {
        this.removeAuthToken();
    }

    // Institutions
    async getInstitutions(): Promise<ApiResponse<any[]>> {
        return this.request('/institutions');
    }
}

export const apiService = new ApiService();
export default apiService;
