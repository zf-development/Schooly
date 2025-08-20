// Service pour gérer les abonnements aux établissements
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface Subscription {
    id: string;
    follower_user_id: string;
    institution_id: string;
    created_at: string;
    institution?: {
        id: string;
        name: string;
        logoUrl?: string;
    };
}

interface InstitutionOption {
    id: string;
    name: string;
    logoUrl?: string;
}

class SubscriptionService {
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

    // Récupérer la liste des abonnements de l'utilisateur
    async list(): Promise<ApiResponse<Subscription[]>> {
        return this.request<Subscription[]>('/subscriptions');
    }

    // Suivre un établissement
    async follow(institutionId: string): Promise<ApiResponse<Subscription>> {
        return this.request<Subscription>('/subscriptions', {
            method: 'POST',
            body: JSON.stringify({ institution_id: institutionId }),
        });
    }

    // Ne plus suivre un établissement
    async unfollow(institutionId: string): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/subscriptions/${institutionId}`, {
            method: 'DELETE',
        });
    }

    // Vérifier si l'utilisateur suit déjà un établissement
    async isFollowing(institutionId: string): Promise<boolean> {
        try {
            const response = await this.list();
            if (response.success && response.data) {
                return response.data.some(sub => sub.institution_id === institutionId);
            }
            return false;
        } catch {
            return false;
        }
    }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;


