import { CalendarEvent } from '../types';
import apiService from './api';

export interface EventsResponse {
    events: CalendarEvent[];
    total_count: number;
}

class CalendarService {
    async getEvents(): Promise<EventsResponse> {
        try {
            const response = await apiService.getCalendarEvents();
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la récupération des événements du calendrier');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des événements du calendrier:', error);
            throw error;
        }
    }

    async getEventById(eventId: string): Promise<CalendarEvent> {
        try {
            const response = await apiService.getCalendarEventById(eventId);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la récupération de l\'événement du calendrier');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'événement du calendrier:', error);
            throw error;
        }
    }

    async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
        try {
            const response = await apiService.createCalendarEvent(event);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la création de l\'événement du calendrier');
            }
        } catch (error) {
            console.error('Erreur lors de la création de l\'événement du calendrier:', error);
            throw error;
        }
    }

    async updateEvent(eventId: string, event: CalendarEvent): Promise<CalendarEvent> {
        try {
            const response = await apiService.updateCalendarEvent(eventId, event);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de la mise à jour de l\'événement du calendrier');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'événement du calendrier:', error);
            throw error;
        }
    }

    async deleteEvent(eventId: string): Promise<boolean> {
        try {
            const response = await apiService.deleteCalendarEvent(eventId);
            if (response.success) {
                return true;
            } else {
                throw new Error(response.error || 'Erreur lors de la suppression de l\'événement du calendrier');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement du calendrier:', error);
            throw error;
        }
    }
}

export default new CalendarService();
