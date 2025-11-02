// Service API pour communiquer avec le backend
// - Gestion automatique des tokens expirés
// - Interception globale des erreurs 401
// - Déconnexion automatique en cas de session expirée

import { CalendarEvent } from "../types";
import { EventsResponse } from "./calendarService";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Callback pour la déconnexion forcée
let onTokenExpired: (() => void) | null = null;

// Fonction pour enregistrer le callback de déconnexion
export const setTokenExpiredCallback = (callback: () => void) => {
    onTokenExpired = callback;
};

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

    // Vérifier si un token est expiré localement
    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            // Vérifier si le token est expiré (avec une marge de 5 minutes)
            if (payload.exp && payload.exp < (currentTime + 300)) {
                return true;
            }

            return false;
        } catch (error) {
            console.error("Erreur lors de la vérification du token:", error);
            return true; // En cas d'erreur, considérer comme expiré
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const token = this.getAuthToken();

            // Vérifier si le token est expiré avant de faire la requête
            if (token && this.isTokenExpired(token)) {
                console.log("Token expiré détecté avant la requête");
                this.removeAuthToken();
                if (onTokenExpired) {
                    onTokenExpired();
                }
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }

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
                        console.log("Erreur 401 reçue - session expirée");
                        this.removeAuthToken();

                        // Déclencher la déconnexion automatique
                        if (onTokenExpired) {
                            onTokenExpired();
                        }

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
        return this.request('/feed/feeds');
    }

    async createPost(postData: { title: string; content: string; visibility: 'public' | 'private' }): Promise<ApiResponse<any>> {
        return this.request('/feed/feeds', {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    }

    async createPostWithFiles(formData: FormData): Promise<ApiResponse<any>> {
        try {
            const token = this.getAuthToken();
            const response = await fetch(`${API_BASE_URL}/feed/feeds/with-files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData, // Pas de Content-Type pour FormData
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

    async updatePost(postId: string, postData: { content: string; visibility: 'public' | 'private' }): Promise<ApiResponse<any>> {
        return this.request(`/feed/feeds/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(postData),
        });
    }

    async deletePost(postId: string): Promise<ApiResponse<any>> {
        return this.request(`/feed/feeds/${postId}`, {
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

    // Likes
    async toggleLike(postId: string): Promise<ApiResponse<{ liked: boolean; likes_count: number }>> {
        return this.request(`/feed/feeds/${postId}/like`, {
            method: 'POST',
        });
    }

    async checkLike(postId: string): Promise<ApiResponse<{ hasLiked: boolean; likesCount: number }>> {
        return this.request(`/feed/feeds/${postId}/like`);
    }

    // Commentaires
    async addComment(postId: string, content: string): Promise<ApiResponse<any>> {
        return this.request(`/feed/feeds/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    async getComments(postId: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<{ comments: any[]; total_count: number }>> {
        return this.request(`/feed/feeds/${postId}/comments?limit=${limit}&offset=${offset}`);
    }

    async updateComment(commentId: string, content: string): Promise<ApiResponse<any>> {
        return this.request(`/feed/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify({ content }),
        });
    }

    async deleteComment(commentId: string): Promise<ApiResponse<any>> {
        return this.request(`/feed/comments/${commentId}`, {
            method: 'DELETE',
        });
    }

    // Hashtags
    async searchByHashtag(hashtag: string, limit: number = 20, offset: number = 0): Promise<ApiResponse<any>> {
        return this.request(`/feed/hashtags/${hashtag}/posts?limit=${limit}&offset=${offset}`);
    }

    async getTrendingHashtags(limit: number = 10): Promise<ApiResponse<any>> {
        return this.request(`/feed/hashtags/trending?limit=${limit}`);
    }

    async getAllHashtags(): Promise<ApiResponse<any>> {
        return this.request('/feed/hashtags/all');
    }

    // Calendar
    async getCalendarEvents(): Promise<ApiResponse<EventsResponse>> {
        return this.request('/calendar');
    }

    async getCalendarEventById(eventId: string): Promise<ApiResponse<CalendarEvent>> {
        return this.request(`/calendar/${eventId}`);
    }

    async createCalendarEvent(event: CalendarEvent): Promise<ApiResponse<CalendarEvent>> {
        return this.request('/calendar', {
            method: 'POST',
            body: JSON.stringify(event),
        });
    }

    async updateCalendarEvent(eventId: string, event: CalendarEvent): Promise<ApiResponse<CalendarEvent>> {
        return this.request(`/calendar/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(event),
        });
    }

    async deleteCalendarEvent(eventId: string): Promise<ApiResponse<{ message: string }>> {
        return this.request(`/calendar/${eventId}`, {
            method: 'DELETE',
        });
    }

    // Méthodes pour les pages
    async getPages(): Promise<ApiResponse<any[]>> {
        return this.request('/pages');
    }

    async getPageById(pageId: string): Promise<ApiResponse<any>> {
        return this.request(`/pages/${pageId}`);
    }

    async createPage(pageData: any): Promise<ApiResponse<any>> {
        // Fonction pour sérialiser de manière sûre
        const safeStringify = (obj: any): string => {
            const seen = new Set();
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return '[Circular Reference]';
                    }
                    seen.add(value);
                }
                return value;
            });
        };

        // Fonction pour s'assurer qu'on a un UUID valide
        const ensureStringId = (id: any): string => {
            if (typeof id === 'string') return id;
            if (typeof id === 'object' && id !== null && id.id) return id.id;
            console.error('ID invalide reçu dans API:', id, typeof id);
            return '';
        };

        // Nettoyer l'objet pour éviter les références circulaires
        const cleanData: any = {
            title: String(pageData.title || ''),
            content: pageData.content, // Peut être null pour les dossiers
            parent_id: pageData.parent_id ? ensureStringId(pageData.parent_id) : null,
            user_id: ensureStringId(pageData.user_id),
            created_by: ensureStringId(pageData.created_by),
            type: String(pageData.type || 'page')
        };

        // Inclure order_index seulement s'il est défini et est un nombre
        if (typeof pageData.order_index === 'number') {
            cleanData.order_index = pageData.order_index;
        }

        // Les données sont nettoyées et prêtes

        return this.request('/pages', {
            method: 'POST',
            body: safeStringify(cleanData),
        });
    }

    async updatePage(pageId: string, pageData: any): Promise<ApiResponse<any>> {
        // Fonction pour sérialiser de manière sûre
        const safeStringify = (obj: any): string => {
            const seen = new Set();
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return '[Circular Reference]';
                    }
                    seen.add(value);
                }
                return value;
            });
        };

        // Nettoyer l'objet pour éviter les références circulaires
        const cleanData: any = {};

        // Copier seulement les propriétés sûres et modifiables
        // user_id, created_by, type, et updated_at sont immutables et ne doivent pas être modifiables
        const safeProps = ['title', 'content', 'parent_id'];
        safeProps.forEach(prop => {
            if (pageData.hasOwnProperty(prop)) {
                cleanData[prop] = pageData[prop];
            }
        });

        return this.request(`/pages/${pageId}`, {
            method: 'PUT',
            body: safeStringify(cleanData),
        });
    }

    async deletePage(pageId: string): Promise<ApiResponse<any>> {
        return this.request(`/pages/${pageId}`, {
            method: 'DELETE',
        });
    }
}

export const apiService = new ApiService();
export default apiService;
