import 'dotenv/config'; // Charger les variables d'environnement
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import feedRoutes from './routes/feedRoutes';
import auditRoutes from './routes/auditRoutes';
import userRoutes from './routes/userRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import institutionRoutes from './routes/institutionRoutes';
import calendarRoutes from './routes/calendarRoutes';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Forcer l'encodage UTF-8 pour corriger les accents
app.use((req, res, next) => {
    // Ajouter le charset UTF-8 seulement si c'est du JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/calendar', calendarRoutes);

// Healthcheck
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404
app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur TS démarré sur le port ${PORT}`);
});

export default app;
