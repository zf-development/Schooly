import apiService from './api';
import { Page } from '../types';

// Type pour les données à envoyer au serveur (sans children)
type CreatePageData = Omit<Page, 'id' | 'created_at' | 'updated_at' | 'children'>;

class PageService {
    // Créer une nouvelle page
    async createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<Page> {
        try {
            // Nettoyer l'objet en supprimant la propriété children et en s'assurant qu'il n'y a pas de références circulaires
            const cleanPage: CreatePageData = {
                title: String(page.title),
                content: page.content,
                parent_id: page.parent_id || null,
                user_id: String(page.user_id),
                created_by: String(page.created_by),
                type: page.type
            };

            const response = await apiService.createPage(cleanPage);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la création de la page');
            }
        } catch (error) {
            // Error creating page
            throw error;
        }
    }

    // Récupérer toutes les pages
    async getPages(): Promise<Page[]> {
        try {
            const response = await apiService.getPages();

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la récupération des pages');
            }
        } catch (error) {
            // Error loading pages
            throw error;
        }
    }

    // Récupérer une page spécifique
    async getPageById(pageId: string): Promise<Page> {
        try {
            const response = await apiService.getPageById(pageId);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la récupération de la page');
            }
        } catch (error) {
            // Error loading page
            throw error;
        }
    }

    // Mettre à jour une page
    async updatePage(pageId: string, page: Partial<Page>): Promise<Page> {
        try {
            // Nettoyer l'objet en supprimant la propriété children
            const { children, ...cleanPage } = page;

            const response = await apiService.updatePage(pageId, cleanPage);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la mise à jour de la page');
            }
        } catch (error) {
            // Error updating page
            throw error;
        }
    }

    // Supprimer une page
    async deletePage(pageId: string): Promise<boolean> {
        try {
            const response = await apiService.deletePage(pageId);

            if (response.success) {
                return true;
            } else {
                throw new Error(response.error || 'Erreur lors de la suppression de la page');
            }
        } catch (error) {
            // Error deleting page
            throw error;
        }
    }
}

const pageService = new PageService();
export default pageService;
