import express from 'express';
import { getUserCalendarEvents, getUserCalendarEventById, createUserCalendarEvent, updateUserCalendarEvent, deleteUserCalendarEvent } from '../controllers/calendarController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUserCalendarEvents);
router.get('/:id', getUserCalendarEventById);
router.post('/', createUserCalendarEvent);
router.put('/:id', updateUserCalendarEvent);
router.delete('/:id', deleteUserCalendarEvent);

export default router;
