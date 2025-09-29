import { Request, Response } from 'express';
import { getUserById } from '../services/supabaseService';
import { getUserCalendarEvents as getUserCalendarEventsService, getUserCalendarEventById as getUserCalendarEventByIdService, createUserCalendarEvent as createUserCalendarEventService, updateUserCalendarEvent as updateUserCalendarEventService, deleteUserCalendarEvent as deleteUserCalendarEventService } from '../services/supabaseService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getUserCalendarEvents = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const events = await getUserCalendarEventsService(req.user.id);
        if (events === null) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des événements du calendrier' });
        }

        const enrichedEvents = await Promise.all(events.map(async (event) => {
            const createdByUser = await getUserById(event.created_by);
            const attendeesUsers = event.attendees ? await Promise.all(event.attendees.map(async (attendee: string) => {
                const attendeeUser = await getUserById(attendee);
                return {
                    ...attendeeUser,
                };
            })) : [];

            return {
                ...event,
                created_by: createdByUser,
                attendees: attendeesUsers
            };
        }));

        res.status(200).json({ events: enrichedEvents });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des événements du calendrier' });
    }
}

export const getUserCalendarEventById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const event = await getUserCalendarEventByIdService(req.params.id);
        if (event === null) {
            return res.status(404).json({ error: 'Événement non trouvé' });
        }

        const createdByUser = await getUserById(event.created_by);
        const attendeesUsers = event.attendees ? await Promise.all(event.attendees.map(async (attendee: string) => {
            const attendeeUser = await getUserById(attendee);
            return {
                ...attendeeUser,
            };
        })) : [];

        res.status(200).json({
            event: {
                ...event,
                created_by: createdByUser,
                attendees: attendeesUsers
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'événement du calendrier' });
    }
}

export const createUserCalendarEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const eventData = {
            ...req.body,
            user_id: req.user.id,
            created_by: req.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const event = await createUserCalendarEventService(eventData);

        if (event === null) {
            return res.status(500).json({ error: 'Erreur lors de la création de l\'événement du calendrier' });
        }

        res.status(201).json(event);
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement du calendrier:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'événement du calendrier' });
    }
}

export const updateUserCalendarEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const eventId = req.params.id;
        const eventData = {
            ...req.body,
            updated_at: new Date().toISOString()
        };

        console.log('Mise à jour de l\'événement:', eventId, eventData);

        const event = await updateUserCalendarEventService(eventId, eventData);

        if (event === null) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement du calendrier' });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement du calendrier:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement du calendrier' });
    }
}

export const deleteUserCalendarEvent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const eventId = req.params.id;

        console.log('Suppression de l\'événement:', eventId);

        const success = await deleteUserCalendarEventService(eventId);

        if (!success) {
            return res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement du calendrier' });
        }

        res.status(200).json({ message: 'Événement supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement du calendrier:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement du calendrier' });
    }
}