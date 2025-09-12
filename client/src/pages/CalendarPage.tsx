import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Group,
    ThemeIcon,
    Stack,
    Card,
    Text,
    Button,
    Grid,
    Badge,
    Modal,
    TextInput,
    Textarea,
    Select,
    ActionIcon,
    Tooltip,
    Box,
    SimpleGrid,
    Paper,
    Divider,
    Center,
    Loader
} from '@mantine/core';
import {
    IconCalendar,
    IconPlus,
    IconEdit,
    IconTrash,
    IconClock,
    IconMapPin,
    IconUsers,
    IconBell,
    IconX,
    IconCheck,
    IconCalendarMonth,
    IconCalendarWeek,
    IconCalendarEvent
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    attendees?: string[];
    type: 'academic' | 'personal' | 'institution';
    reminder?: boolean;
    createdBy: string;
    createdAt: Date;
}

type ViewType = 'month' | 'week' | 'day';

const CalendarPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [clickedDate, setClickedDate] = useState<Date | null>(null);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>('month');

    // État du formulaire
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        type: 'academic' as 'academic' | 'personal' | 'institution',
        reminder: false
    });

    // Données d'exemple
    useEffect(() => {
        const sampleEvents: Event[] = [
            // Événements académiques - Septembre 2025
            {
                id: '1',
                title: 'Examen de Mathématiques',
                description: 'Examen final de calcul différentiel et intégral - Chapitres 1 à 8',
                startDate: new Date(2025, 8, 15, 9, 0), // 15 septembre 2025
                endDate: new Date(2025, 8, 15, 12, 0),
                location: 'Salle 201',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '2',
                title: 'Cours de Physique',
                description: 'Mécanique quantique - Introduction aux concepts fondamentaux',
                startDate: new Date(2025, 8, 16, 10, 0), // 16 septembre 2025
                endDate: new Date(2025, 8, 16, 12, 0),
                location: 'Amphithéâtre A',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '2b',
                title: 'Réunion d\'équipe',
                description: 'Préparation du projet de recherche - Équipe de 5 personnes',
                startDate: new Date(2025, 8, 16, 14, 0), // 16 septembre 2025 - après-midi
                endDate: new Date(2025, 8, 16, 16, 0),
                location: 'Salle de réunion 3B',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '2c',
                title: 'Séance de sport',
                description: 'Entraînement de natation - Piscine universitaire',
                startDate: new Date(2025, 8, 16, 18, 0), // 16 septembre 2025 - soir
                endDate: new Date(2025, 8, 16, 19, 30),
                location: 'Piscine universitaire',
                type: 'personal',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '3',
                title: 'Laboratoire de Chimie',
                description: 'Synthèse organique - Expérience sur les réactions d\'estérification',
                startDate: new Date(2025, 8, 17, 14, 0), // 17 septembre 2025
                endDate: new Date(2025, 8, 17, 17, 0),
                location: 'Laboratoire 3B',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '4',
                title: 'Rendu de projet',
                description: 'Projet de programmation web - Site e-commerce avec React et Node.js',
                startDate: new Date(2025, 8, 18, 23, 59), // 18 septembre 2025
                endDate: new Date(2025, 8, 18, 23, 59),
                location: 'Plateforme en ligne',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '5',
                title: 'Séminaire de recherche',
                description: 'Présentation des travaux de recherche en intelligence artificielle',
                startDate: new Date(2025, 8, 19, 15, 0), // 19 septembre 2025
                endDate: new Date(2025, 8, 19, 17, 0),
                location: 'Salle de conférence',
                type: 'academic',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            // Événements personnels
            {
                id: '6',
                title: 'Anniversaire de Marie',
                description: 'Fête d\'anniversaire - Restaurant Le Bistrot',
                startDate: new Date(2025, 8, 20, 19, 0), // 20 septembre 2025
                endDate: new Date(2025, 8, 20, 23, 0),
                location: 'Restaurant Le Bistrot, 123 rue de la Paix',
                type: 'personal',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '6b',
                title: 'Cours de Mathématiques',
                description: 'Calcul différentiel - Chapitre 3: Dérivées partielles',
                startDate: new Date(2025, 8, 20, 9, 0), // 20 septembre 2025 - matin
                endDate: new Date(2025, 8, 20, 11, 0),
                location: 'Salle 201',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '6c',
                title: 'Atelier de programmation',
                description: 'Introduction à React - Hooks et composants',
                startDate: new Date(2025, 8, 20, 14, 0), // 20 septembre 2025 - après-midi
                endDate: new Date(2025, 8, 20, 17, 0),
                location: 'Salle informatique 1',
                type: 'academic',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '7',
                title: 'Rendez-vous médical',
                description: 'Contrôle de routine chez le médecin généraliste',
                startDate: new Date(2025, 8, 22, 14, 30), // 22 septembre 2025
                endDate: new Date(2025, 8, 22, 15, 30),
                location: 'Cabinet Dr. Martin, 45 avenue des Champs',
                type: 'personal',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '8',
                title: 'Séance de sport',
                description: 'Entraînement au gymnase - Musculation et cardio',
                startDate: new Date(2025, 8, 23, 18, 0), // 23 septembre 2025
                endDate: new Date(2025, 8, 23, 20, 0),
                location: 'Gymnase universitaire',
                type: 'personal',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            // Événements institutionnels
            {
                id: '9',
                title: 'Conférence sur l\'innovation',
                description: 'L\'avenir de la technologie dans l\'éducation - Conférencier invité',
                startDate: new Date(2025, 8, 21, 18, 0), // 21 septembre 2025
                endDate: new Date(2025, 8, 21, 20, 0),
                location: 'Amphithéâtre principal',
                type: 'institution',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '10',
                title: 'Journée portes ouvertes',
                description: 'Découverte des programmes d\'études - Visite guidée du campus',
                startDate: new Date(2025, 8, 24, 9, 0), // 24 septembre 2025
                endDate: new Date(2025, 8, 24, 16, 0),
                location: 'Hall principal et salles de cours',
                type: 'institution',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '11',
                title: 'Réunion de projet',
                description: 'Discussion sur le projet de fin d\'études - Équipe de 4 personnes',
                startDate: new Date(2025, 8, 25, 14, 0), // 25 septembre 2025
                endDate: new Date(2025, 8, 25, 16, 0),
                location: 'Bibliothèque - Salle de travail en groupe',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '11b',
                title: 'Cours de Français',
                description: 'Littérature française - Analyse de "Les Misérables"',
                startDate: new Date(2025, 8, 25, 9, 0), // 25 septembre 2025 - matin
                endDate: new Date(2025, 8, 25, 11, 0),
                location: 'Salle 105',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '11c',
                title: 'Déjeuner avec les amis',
                description: 'Repas au restaurant universitaire - Discussion sur les cours',
                startDate: new Date(2025, 8, 25, 12, 0), // 25 septembre 2025 - midi
                endDate: new Date(2025, 8, 25, 13, 30),
                location: 'Restaurant universitaire',
                type: 'personal',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '11d',
                title: 'Séance de révision',
                description: 'Révision pour l\'examen de mathématiques - Bibliothèque',
                startDate: new Date(2025, 8, 25, 18, 0), // 25 septembre 2025 - soir
                endDate: new Date(2025, 8, 25, 20, 0),
                location: 'Bibliothèque - Zone silencieuse',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '12',
                title: 'Examen de Français',
                description: 'Épreuve de littérature française - Analyse de texte et dissertation',
                startDate: new Date(2025, 8, 26, 8, 30), // 26 septembre 2025
                endDate: new Date(2025, 8, 26, 11, 30),
                location: 'Salle 105',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '13',
                title: 'Atelier de programmation',
                description: 'Introduction à Python - Session pratique avec exercices',
                startDate: new Date(2025, 8, 27, 10, 0), // 27 septembre 2025
                endDate: new Date(2025, 8, 27, 12, 0),
                location: 'Salle informatique 2',
                type: 'academic',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '14',
                title: 'Soirée culturelle',
                description: 'Spectacle de théâtre étudiant - Pièce "Les Misérables"',
                startDate: new Date(2025, 8, 28, 19, 30), // 28 septembre 2025
                endDate: new Date(2025, 8, 28, 22, 0),
                location: 'Théâtre de l\'université',
                type: 'institution',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '14b',
                title: 'Cours de Physique',
                description: 'Mécanique quantique - Exercices pratiques',
                startDate: new Date(2025, 8, 28, 10, 0), // 28 septembre 2025 - matin
                endDate: new Date(2025, 8, 28, 12, 0),
                location: 'Amphithéâtre A',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '14c',
                title: 'Laboratoire de Chimie',
                description: 'Analyse spectroscopique - Utilisation des instruments',
                startDate: new Date(2025, 8, 28, 14, 0), // 28 septembre 2025 - après-midi
                endDate: new Date(2025, 8, 28, 17, 0),
                location: 'Laboratoire 2A',
                type: 'academic',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '14d',
                title: 'Rendez-vous coiffeur',
                description: 'Coupe et soins - Salon de coiffure du centre-ville',
                startDate: new Date(2025, 8, 28, 16, 0), // 28 septembre 2025 - fin d'après-midi
                endDate: new Date(2025, 8, 28, 17, 30),
                location: 'Salon Coiffure Moderne, 45 rue du Centre',
                type: 'personal',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '15',
                title: 'Rendez-vous avec le conseiller',
                description: 'Planification du parcours académique - Orientation professionnelle',
                startDate: new Date(2025, 8, 29, 15, 0), // 29 septembre 2025
                endDate: new Date(2025, 8, 29, 16, 0),
                location: 'Bureau des conseillers - Bâtiment administratif',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            // Événements d'octobre 2025
            {
                id: '16',
                title: 'Examen de mi-session',
                description: 'Examen de mi-session - Toutes les matières',
                startDate: new Date(2025, 9, 2, 9, 0), // 2 octobre 2025
                endDate: new Date(2025, 9, 2, 17, 0),
                location: 'Salles d\'examen - Bâtiment principal',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '16b',
                title: 'Petit-déjeuner d\'équipe',
                description: 'Repas avant l\'examen - Café universitaire',
                startDate: new Date(2025, 9, 2, 7, 30), // 2 octobre 2025 - très tôt
                endDate: new Date(2025, 9, 2, 8, 30),
                location: 'Café universitaire',
                type: 'personal',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '16c',
                title: 'Séance de révision finale',
                description: 'Révision intensive avant l\'examen - Bibliothèque',
                startDate: new Date(2025, 9, 2, 18, 0), // 2 octobre 2025 - après l'examen
                endDate: new Date(2025, 9, 2, 20, 0),
                location: 'Bibliothèque - Zone silencieuse',
                type: 'academic',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '17',
                title: 'Week-end de détente',
                description: 'Sortie en groupe - Randonnée dans les montagnes',
                startDate: new Date(2025, 9, 5, 8, 0), // 5 octobre 2025
                endDate: new Date(2025, 9, 6, 18, 0),
                location: 'Parc national des Laurentides',
                type: 'personal',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '18',
                title: 'Conférence sur l\'environnement',
                description: 'Changements climatiques et solutions durables',
                startDate: new Date(2025, 9, 10, 19, 0), // 10 octobre 2025
                endDate: new Date(2025, 9, 10, 21, 0),
                location: 'Auditorium des sciences',
                type: 'institution',
                reminder: false,
                createdBy: user?.id || '',
                createdAt: new Date()
            }
        ];
        setEvents(sampleEvents);
    }, [user?.id]);

    if (!user) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    const handleCreateEvent = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            location: '',
            type: 'academic',
            reminder: false
        });
        setModalOpened(true);
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || '',
            startDate: event.startDate.toISOString().slice(0, 16),
            endDate: event.endDate.toISOString().slice(0, 16),
            location: event.location || '',
            type: event.type,
            reminder: event.reminder || false
        });
        setModalOpened(true);
    };

    const handleSaveEvent = () => {
        if (!formData.title || !formData.startDate || !formData.endDate) return;

        const newEvent: Event = {
            id: editingEvent?.id || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            location: formData.location,
            type: formData.type,
            reminder: formData.reminder,
            createdBy: user.id,
            createdAt: editingEvent?.createdAt || new Date()
        };

        if (editingEvent) {
            setEvents(events.map(e => e.id === editingEvent.id ? newEvent : e));
        } else {
            setEvents([...events, newEvent]);
        }

        setModalOpened(false);
        setFormData({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            location: '',
            type: 'academic',
            reminder: false
        });
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(events.filter(e => e.id !== eventId));
    };

    const handleDateClick = (date: Date) => {
        setClickedDate(date);
    };

    const handleViewChange = (view: ViewType) => {
        setCurrentView(view);
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        
        switch (currentView) {
            case 'month':
                newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
                break;
            case 'day':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
                break;
        }
        
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Calculer les dates de la semaine
    const getWeekDates = (date: Date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day; // Dimanche
        startOfWeek.setDate(diff);
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const weekDate = new Date(startOfWeek);
            weekDate.setDate(startOfWeek.getDate() + i);
            weekDates.push(weekDate);
        }
        return weekDates;
    };

    // Obtenir les événements pour une période donnée
    const getEventsForPeriod = (startDate: Date, endDate: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= startDate && eventDate <= endDate;
        });
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'academic': return 'blue';
            case 'personal': return 'green';
            case 'institution': return 'violet';
            default: return 'gray';
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'academic': return 'Académique';
            case 'personal': return 'Personnel';
            case 'institution': return 'Institution';
            default: return 'Autre';
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Filtrer les événements du mois sélectionné
    const currentMonthEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === selectedDate.getMonth() && 
               eventDate.getFullYear() === selectedDate.getFullYear();
    });

    // Événements d'aujourd'hui
    const todayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    });

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconCalendar size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Calendrier
                            </Title>
                            <Text c="dimmed" size="sm">
                                Gérez vos événements et rendez-vous
                            </Text>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={handleCreateEvent}
                            color="violet"
                        >
                            Nouvel événement
                        </Button>
                    </Group>
                </Group>

                {/* Sélecteur de vue */}
                <Group justify="center" mb="md">
                    <Button.Group>
                        <Button
                            variant={currentView === 'month' ? 'filled' : 'light'}
                            leftSection={<IconCalendarMonth size={16} />}
                            onClick={() => handleViewChange('month')}
                        >
                            Mois
                        </Button>
                        <Button
                            variant={currentView === 'week' ? 'filled' : 'light'}
                            leftSection={<IconCalendarWeek size={16} />}
                            onClick={() => handleViewChange('week')}
                        >
                            Semaine
                        </Button>
                        <Button
                            variant={currentView === 'day' ? 'filled' : 'light'}
                            leftSection={<IconCalendarEvent size={16} />}
                            onClick={() => handleViewChange('day')}
                        >
                            Jour
                        </Button>
                    </Button.Group>
                </Group>

                <Grid>
                    {/* Calendrier principal */}
                    <Grid.Col span={8}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="md">
                                <Title order={3}>
                                    {currentView === 'month' && selectedDate.toLocaleDateString('fr-FR', { 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                    {currentView === 'week' && (() => {
                                        const weekDates = getWeekDates(selectedDate);
                                        const startDate = weekDates[0];
                                        const endDate = weekDates[6];
                                        return `${startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                                    })()}
                                    {currentView === 'day' && selectedDate.toLocaleDateString('fr-FR', { 
                                        weekday: 'long',
                                        day: 'numeric', 
                                        month: 'long',
                                        year: 'numeric' 
                                    })}
                                </Title>
                                <Button.Group>
                                    <Button variant="light" size="sm" onClick={() => navigateDate('prev')}>
                                        Précédent
                                    </Button>
                                    <Button variant="light" size="sm" onClick={goToToday}>
                                        Aujourd'hui
                                    </Button>
                                    <Button variant="light" size="sm" onClick={() => navigateDate('next')}>
                                        Suivant
                                    </Button>
                                </Button.Group>
                            </Group>

                            {/* Contenu selon la vue */}
                            {currentView === 'month' && (
                                <SimpleGrid cols={7} spacing="xs">
                                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                                        <Paper key={day} p="xs" ta="center" bg="gray.0">
                                            <Text size="sm" fw={500}>{day}</Text>
                                        </Paper>
                                    ))}
                                    
                                    {/* Jours du mois */}
                                    {(() => {
                                        // Calculer le premier jour du mois et le nombre de jours
                                        const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                                        const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                                        const daysInMonth = lastDay.getDate();
                                        
                                        // Calculer le jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
                                        const firstDayOfWeek = firstDay.getDay();
                                        const sundayOffset = firstDayOfWeek; // Dimanche = 0
                                        
                                        // Calculer le nombre de semaines nécessaires
                                        const totalDays = sundayOffset + daysInMonth;
                                        const weeksNeeded = Math.ceil(totalDays / 7);
                                        
                                        const calendarDays = [];
                                        
                                        // Ajouter les jours du mois précédent si nécessaire
                                        for (let i = 0; i < sundayOffset; i++) {
                                            const prevMonthDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), -sundayOffset + i + 1);
                                            calendarDays.push({
                                                date: prevMonthDay,
                                                isCurrentMonth: false,
                                                day: prevMonthDay.getDate()
                                            });
                                        }
                                        
                                        // Ajouter les jours du mois actuel
                                        for (let day = 1; day <= daysInMonth; day++) {
                                            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                                            calendarDays.push({
                                                date,
                                                isCurrentMonth: true,
                                                day
                                            });
                                        }
                                        
                                        // Ajouter les jours du mois suivant pour compléter la dernière semaine
                                        const remainingDays = weeksNeeded * 7 - calendarDays.length;
                                        for (let day = 1; day <= remainingDays; day++) {
                                            const nextMonthDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, day);
                                            calendarDays.push({
                                                date: nextMonthDay,
                                                isCurrentMonth: false,
                                                day
                                            });
                                        }
                                        
                                        return calendarDays.map((calendarDay, i) => {
                                            const { date, isCurrentMonth, day } = calendarDay;
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            const dayEvents = events.filter(event => {
                                                const eventDate = new Date(event.startDate);
                                                return eventDate.toDateString() === date.toDateString();
                                            });

                                            const isClicked = clickedDate && clickedDate.toDateString() === date.toDateString();

                                            return (
                                                <Paper
                                                    key={i}
                                                    p="xs"
                                                    ta="center"
                                                    bg={isClicked ? 'blue.0' : isToday ? 'violet.0' : isCurrentMonth ? 'white' : 'gray.1'}
                                                    style={{ 
                                                        minHeight: 80,
                                                        cursor: 'pointer',
                                                        border: isClicked ? '2px solid var(--mantine-color-blue-3)' : 
                                                                isToday ? '2px solid var(--mantine-color-violet-3)' : 
                                                                '1px solid var(--mantine-color-gray-2)'
                                                    }}
                                                    onClick={() => handleDateClick(date)}
                                                >
                                                    <Text 
                                                        size="sm" 
                                                        c={isCurrentMonth ? 'dark' : 'dimmed'}
                                                        fw={isToday ? 600 : 400}
                                                    >
                                                        {day}
                                                    </Text>
                                                    {dayEvents.length > 0 && (
                                                        <Stack gap={2} mt={4}>
                                                            {dayEvents.slice(0, 2).map(event => (
                                                                <Badge
                                                                    key={event.id}
                                                                    size="xs"
                                                                    color={getEventTypeColor(event.type)}
                                                                    variant="light"
                                                                >
                                                                    {event.title}
                                                                </Badge>
                                                            ))}
                                                            {dayEvents.length > 2 && (
                                                                <Text size="xs" c="dimmed">
                                                                    +{dayEvents.length - 2} autres
                                                                </Text>
                                                            )}
                                                        </Stack>
                                                    )}
                                                </Paper>
                                            );
                                        });
                                    })()}
                                </SimpleGrid>
                            )}

                            {currentView === 'week' && (
                                <SimpleGrid cols={7} spacing="xs">
                                    {getWeekDates(selectedDate).map((date, index) => {
                                        const isToday = date.toDateString() === new Date().toDateString();
                                        const dayEvents = events.filter(event => {
                                            const eventDate = new Date(event.startDate);
                                            return eventDate.toDateString() === date.toDateString();
                                        });

                                        return (
                                            <Paper
                                                key={index}
                                                p="xs"
                                                ta="center"
                                                bg={isToday ? 'violet.0' : 'white'}
                                                style={{ 
                                                    minHeight: 120,
                                                    cursor: 'pointer',
                                                    border: isToday ? '2px solid var(--mantine-color-violet-3)' : '1px solid var(--mantine-color-gray-2)'
                                                }}
                                                onClick={() => handleDateClick(date)}
                                            >
                                                <Text 
                                                    size="sm" 
                                                    fw={isToday ? 600 : 400}
                                                    mb="xs"
                                                >
                                                    {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                                </Text>
                                                <Stack gap={2}>
                                                    {dayEvents.slice(0, 4).map(event => (
                                                        <Badge
                                                            key={event.id}
                                                            size="xs"
                                                            color={getEventTypeColor(event.type)}
                                                            variant="light"
                                                            style={{ fontSize: '10px' }}
                                                        >
                                                            {event.title}
                                                        </Badge>
                                                    ))}
                                                    {dayEvents.length > 4 && (
                                                        <Text size="xs" c="dimmed">
                                                            +{dayEvents.length - 4} autres
                                                        </Text>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        );
                                    })}
                                </SimpleGrid>
                            )}

                            {currentView === 'day' && (
                                <Box>
                                    <Text size="lg" fw={500} mb="md">
                                        {selectedDate.toLocaleDateString('fr-FR', { 
                                            weekday: 'long',
                                            day: 'numeric', 
                                            month: 'long',
                                            year: 'numeric' 
                                        })}
                                    </Text>
                                    <Stack gap="sm">
                                        {(() => {
                                            const dayEvents = events.filter(event => {
                                                const eventDate = new Date(event.startDate);
                                                return eventDate.toDateString() === selectedDate.toDateString();
                                            }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

                                            return dayEvents.length > 0 ? (
                                                dayEvents.map(event => (
                                                    <Paper key={event.id} p="md" bg="gray.0">
                                                        <Group justify="space-between" align="flex-start">
                                                            <Box style={{ flex: 1 }}>
                                                                <Text fw={500} size="sm">
                                                                    {event.title}
                                                                </Text>
                                                                <Text size="xs" c="dimmed">
                                                                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                                                </Text>
                                                                {event.location && (
                                                                    <Text size="xs" c="dimmed">
                                                                        <IconMapPin size={12} style={{ marginRight: 4 }} />
                                                                        {event.location}
                                                                    </Text>
                                                                )}
                                                                {event.description && (
                                                                    <Text size="xs" c="dimmed" mt="xs">
                                                                        {event.description}
                                                                    </Text>
                                                                )}
                                                            </Box>
                                                            <Group gap="xs">
                                                                <Badge size="sm" color={getEventTypeColor(event.type)}>
                                                                    {getEventTypeLabel(event.type)}
                                                                </Badge>
                                                                <ActionIcon
                                                                    size="sm"
                                                                    variant="subtle"
                                                                    onClick={() => handleEditEvent(event)}
                                                                >
                                                                    <IconEdit size={12} />
                                                                </ActionIcon>
                                                                <ActionIcon
                                                                    size="sm"
                                                                    variant="subtle"
                                                                    color="red"
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                >
                                                                    <IconTrash size={12} />
                                                                </ActionIcon>
                                                            </Group>
                                                        </Group>
                                                    </Paper>
                                                ))
                                            ) : (
                                                <Text size="sm" c="dimmed" ta="center" py="xl">
                                                    Aucun événement ce jour
                                                </Text>
                                            );
                                        })()}
                                    </Stack>
                                </Box>
                            )}
                        </Card>
                    </Grid.Col>

                    {/* Panneau latéral */}
                    <Grid.Col span={4}>
                        <Stack>
                            {/* Événements de la date sélectionnée */}
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Title order={4} mb="md">
                                    {clickedDate ? 
                                        `Événements du ${clickedDate.toLocaleDateString('fr-FR', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long' 
                                        })}` : 
                                        'Sélectionnez une date'
                                    }
                                </Title>
                                {clickedDate ? (
                                    (() => {
                                        const clickedDateEvents = events.filter(event => {
                                            const eventDate = new Date(event.startDate);
                                            return eventDate.toDateString() === clickedDate.toDateString();
                                        });
                                        
                                        return clickedDateEvents.length > 0 ? (
                                            <Stack gap="sm">
                                                {clickedDateEvents.map(event => (
                                                    <Paper key={event.id} p="sm" bg="gray.0">
                                                        <Group justify="space-between" align="flex-start">
                                                            <Box style={{ flex: 1 }}>
                                                                <Text fw={500} size="sm">
                                                                    {event.title}
                                                                </Text>
                                                                <Text size="xs" c="dimmed">
                                                                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                                                </Text>
                                                                {event.location && (
                                                                    <Text size="xs" c="dimmed">
                                                                        <IconMapPin size={12} style={{ marginRight: 4 }} />
                                                                        {event.location}
                                                                    </Text>
                                                                )}
                                                                {event.description && (
                                                                    <Text size="xs" c="dimmed" mt="xs">
                                                                        {event.description}
                                                                    </Text>
                                                                )}
                                                            </Box>
                                                            <Group gap="xs">
                                                                <Badge size="xs" color={getEventTypeColor(event.type)}>
                                                                    {getEventTypeLabel(event.type)}
                                                                </Badge>
                                                                <ActionIcon
                                                                    size="sm"
                                                                    variant="subtle"
                                                                    onClick={() => handleEditEvent(event)}
                                                                >
                                                                    <IconEdit size={12} />
                                                                </ActionIcon>
                                                                <ActionIcon
                                                                    size="sm"
                                                                    variant="subtle"
                                                                    color="red"
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                >
                                                                    <IconTrash size={12} />
                                                                </ActionIcon>
                                                            </Group>
                                                        </Group>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Text size="sm" c="dimmed" ta="center">
                                                Aucun événement ce jour
                                            </Text>
                                        );
                                    })()
                                ) : (
                                    <Text size="sm" c="dimmed" ta="center">
                                        Cliquez sur une date du calendrier pour voir ses événements
                                    </Text>
                                )}
                            </Card>

                            {/* Événements d'aujourd'hui */}
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Title order={4} mb="md">
                                    Aujourd'hui
                                </Title>
                                {todayEvents.length > 0 ? (
                                    <Stack gap="sm">
                                        {todayEvents.slice(0, 3).map(event => (
                                            <Paper key={event.id} p="sm" bg="gray.0">
                                                <Group justify="space-between" align="flex-start">
                                                    <Box style={{ flex: 1 }}>
                                                        <Text fw={500} size="sm">
                                                            {event.title}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                                        </Text>
                                                    </Box>
                                                    <Badge size="xs" color={getEventTypeColor(event.type)}>
                                                        {getEventTypeLabel(event.type)}
                                                    </Badge>
                                                </Group>
                                            </Paper>
                                        ))}
                                        {todayEvents.length > 3 && (
                                            <Text size="xs" c="dimmed" ta="center">
                                                +{todayEvents.length - 3} autres événements
                                            </Text>
                                        )}
                                    </Stack>
                                ) : (
                                    <Text size="sm" c="dimmed" ta="center">
                                        Aucun événement aujourd'hui
                                    </Text>
                                )}
                            </Card>
                        </Stack>
                    </Grid.Col>
                </Grid>

                {/* Modal de création/édition d'événement */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={editingEvent ? "Modifier l'événement" : "Nouvel événement"}
                    size="md"
                >
                    <Stack gap="md">
                        <TextInput
                            label="Titre"
                            placeholder="Titre de l'événement"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <Textarea
                            label="Description"
                            placeholder="Description de l'événement"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />

                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Date de début"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Date de fin"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </Grid.Col>
                        </Grid>

                        <TextInput
                            label="Lieu"
                            placeholder="Lieu de l'événement"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />

                        <Select
                            label="Type d'événement"
                            value={formData.type}
                            onChange={(value) => setFormData({ ...formData, type: value as any })}
                            data={[
                                { value: 'academic', label: 'Académique' },
                                { value: 'personal', label: 'Personnel' },
                                { value: 'institution', label: 'Institution' }
                            ]}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={() => setModalOpened(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleSaveEvent} color="violet">
                                {editingEvent ? 'Modifier' : 'Créer'}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
        </MainLayout>
    );
};

export default CalendarPage;
