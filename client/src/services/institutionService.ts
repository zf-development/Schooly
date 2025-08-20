// Service pour gérer les établissements
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface Institution {
    id: string;
    name: string;
    logoUrl?: string;
    description?: string;
    created_at?: string;
}

class InstitutionService {
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

    // Récupérer tous les établissements disponibles
    async getAllInstitutions(): Promise<ApiResponse<Institution[]>> {
        return this.request<Institution[]>('/institutions');
    }

    // Récupérer un établissement par son ID
    async getInstitutionById(id: string): Promise<ApiResponse<Institution>> {
        return this.request<Institution>(`/institutions/${id}`);
    }
}

export const institutionService = new InstitutionService();
export default institutionService;
