import React, { useState, useEffect } from 'react';
import { Title, Group, ThemeIcon, Stack, Text, Button, Grid, Modal, TextInput, Textarea, Select, ActionIcon, Box, SimpleGrid, Center, Loader, ScrollArea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconCalendar, IconPlus, IconEdit, IconTrash, IconClock, IconMapPin, IconCalendarMonth, IconCalendarWeek, IconCalendarEvent } from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';
import { CalendarEvent as Event } from '../types';
import calendarService from '../services/calendarService';

type ViewType = 'month' | 'week' | 'day';

const CalendarPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [clickedDate, setClickedDate] = useState<Date | null>(null);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [currentView, setCurrentView] = useState<ViewType>('month');
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        type: 'academic' as 'academic' | 'personal' | 'institution',
        reminder: false
    });

    if (!user) {
        return (
            <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    const fetchEvents = async () => {
        const response = await calendarService.getEvents();
        if (response.events) {
            // Convertir les dates UTC en objets Date (affichage en heure locale)
            const eventsWithDates = response.events.map(event => ({
                ...event,
                start_date: new Date(event.start_date),
                end_date: new Date(event.end_date),
                created_at: new Date(event.created_at)
            }));
            setEvents(eventsWithDates);
        }
    }

    useEffect(() => {
        fetchEvents();
    }, [user?.id]);

    // Fonction utilitaire pour gérer les heures par défaut
    const processEventDates = (startDateStr: string, endDateStr: string) => {
        if (!startDateStr || !endDateStr) {
            throw new Error('Les dates de début et de fin sont requises');
        }

        let startDate = new Date(startDateStr);
        let endDate = new Date(endDateStr);

        // Vérifier que les dates sont valides
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Les dates fournies ne sont pas valides');
        }

        const startTimeString = startDateStr.split('T')[1];
        const endTimeString = endDateStr.split('T')[1];

        if (!startTimeString) {
            startDate.setHours(0, 0, 0, 0);
        }

        if (!endTimeString) {
            endDate.setHours(23, 59, 59, 999);
        }

        return { startDate, endDate };
    };

    const handleCreateEvent = () => {
        setEditingEvent(null);
        setModalOpened(true);
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

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);

        // S'assurer que les dates sont des objets Date
        const startDate = event.start_date instanceof Date ? event.start_date : new Date(event.start_date);
        const endDate = event.end_date instanceof Date ? event.end_date : new Date(event.end_date);

        // Convertir les dates UTC en format local pour l'édition
        const startDateLocal = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
        const endDateLocal = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

        setFormData({
            title: event.title,
            description: event.description || '',
            startDate: startDateLocal.toISOString().slice(0, 16),
            endDate: endDateLocal.toISOString().slice(0, 16),
            location: event.location || '',
            type: event.type,
            reminder: event.reminder || false
        });
        setModalOpened(true);
    };

    const handleSaveEvent = async () => {
        if (!formData.title || !formData.startDate || !formData.endDate) {
            return;
        }

        setIsCreatingEvent(true);
        try {
            const { startDate, endDate } = processEventDates(formData.startDate, formData.endDate);

            // Convertir les dates locales en UTC pour la sauvegarde
            const startDateUTC = new Date(startDate).toISOString();
            const endDateUTC = new Date(endDate).toISOString();

            const eventData = {
                title: formData.title,
                description: formData.description,
                start_date: startDateUTC,
                end_date: endDateUTC,
                location: formData.location,
                type: formData.type,
                reminder: formData.reminder,
                created_by: user.id,
                created_at: new Date().toISOString()
            };

            let savedEvent;
            if (editingEvent) {
                // Mise à jour d'un événement existant
                savedEvent = await calendarService.updateEvent(editingEvent.id!, eventData);
            } else {
                // Création d'un nouvel événement
                savedEvent = await calendarService.createEvent(eventData);
            }

            if (savedEvent) {
                await fetchEvents();
                setModalOpened(false);
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
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'événement:', error);
        } finally {
            setIsCreatingEvent(false);
        }
    };

    const handleDeleteEvent = async (eventId: string | undefined) => {
        if (!eventId) return;

        try {
            const success = await calendarService.deleteEvent(eventId);
            if (success) {
                // Rafraîchir la liste complète des événements
                await fetchEvents();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
        }
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

    const getEventsForPeriod = (startDate: Date, endDate: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start_date);
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

    const formatTime = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return 'Heure invalide';
        }
        return dateObj.toLocaleTimeString('fr-FR', {
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

    const currentMonthEvents = events.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear();
    });

    const todayEvents = events.filter(event => {
        const eventDate = new Date(event.start_date);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    });

    return (
        <MainLayout authProps={{ onLogout: () => { }, onLogin: () => { }, isAuthenticated: true }}>
            <Box style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* En-tête harmonisé avec Messagerie et Abonnements */}
                <Group justify="space-between" align="center" mb="xs" style={{ flexShrink: 0 }}>
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
                            variant="light"
                        >
                            Nouvel événement
                        </Button>
                    </Group>
                </Group>

                {/* Contenu principal avec hauteur flexible */}
                <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <Grid style={{ height: '100%', overflow: 'hidden' }} m={0} p={0}>
                        {/* Calendrier principal */}
                        <Grid.Col span={8} style={{ height: '100%', overflow: 'hidden' }} p={0}>
                            <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '12px', overflow: 'hidden' }}>
                                {/* Titre et contrôles sur une seule ligne */}
                                <Group justify="space-between" mb="sm">
                                    <Title order={2} c="dark">
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

                                    {/* Boutons de vue et pagination */}
                                    <Group gap="md">
                                        {/* Sélecteur de vue */}
                                        <Button.Group>
                                            <Button
                                                variant={currentView === 'month' ? 'filled' : 'light'}
                                                leftSection={<IconCalendarMonth size={16} />}
                                                onClick={() => handleViewChange('month')}
                                                size="sm"
                                            >
                                                Mois
                                            </Button>
                                            <Button
                                                variant={currentView === 'week' ? 'filled' : 'light'}
                                                leftSection={<IconCalendarWeek size={16} />}
                                                onClick={() => handleViewChange('week')}
                                                size="sm"
                                            >
                                                Semaine
                                            </Button>
                                            <Button
                                                variant={currentView === 'day' ? 'filled' : 'light'}
                                                leftSection={<IconCalendarEvent size={16} />}
                                                onClick={() => handleViewChange('day')}
                                                size="sm"
                                            >
                                                Jour
                                            </Button>
                                        </Button.Group>

                                        {/* Pagination */}
                                        <Button.Group>
                                            <Button variant="subtle" size="sm" onClick={() => navigateDate('prev')}>
                                                Précédent
                                            </Button>
                                            <Button variant="subtle" size="sm" onClick={goToToday}>
                                                Aujourd'hui
                                            </Button>
                                            <Button variant="subtle" size="sm" onClick={() => navigateDate('next')}>
                                                Suivant
                                            </Button>
                                        </Button.Group>
                                    </Group>
                                </Group>

                                {/* Contenu selon la vue */}
                                <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                                    {currentView === 'month' && (
                                        <SimpleGrid cols={7} spacing="xs">
                                            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                                                <Box key={day} ta="center" p="xs" style={{
                                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                                    borderRadius: '8px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text size="xs" fw={600} c="dimmed">{day}</Text>
                                                </Box>
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

                                                // Calculer la hauteur dynamique des cellules selon le nombre de semaines
                                                const cellHeight = `calc((100vh - 320px) / ${weeksNeeded})`;

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
                                                        const eventDate = new Date(event.start_date);
                                                        return eventDate.toDateString() === date.toDateString();
                                                    });

                                                    const isClicked = clickedDate && clickedDate.toDateString() === date.toDateString();

                                                    return (
                                                        <Box
                                                            key={i}
                                                            p="xs"
                                                            ta="center"
                                                            style={{
                                                                height: cellHeight,
                                                                cursor: 'pointer',
                                                                backgroundColor: isClicked ? 'var(--mantine-color-blue-0)' :
                                                                    isToday ? 'var(--mantine-color-violet-0)' :
                                                                        isCurrentMonth ? 'white' : 'var(--mantine-color-gray-1)',
                                                                border: isClicked ? '2px solid var(--mantine-color-blue-3)' :
                                                                    isToday ? '2px solid var(--mantine-color-violet-3)' :
                                                                        '1px solid var(--mantine-color-gray-2)',
                                                                borderRadius: '12px',
                                                                transition: 'all 0.2s ease',
                                                                overflow: 'hidden',
                                                                boxShadow: isClicked ? '0 4px 12px rgba(34, 139, 34, 0.15)' :
                                                                    isToday ? '0 4px 12px rgba(139, 69, 19, 0.15)' :
                                                                        '0 2px 4px rgba(0, 0, 0, 0.05)'
                                                            }}
                                                            onClick={() => handleDateClick(date)}
                                                        >
                                                            <Text
                                                                size="xs"
                                                                c={isCurrentMonth ? 'dark' : 'dimmed'}
                                                                fw={isToday ? 600 : 400}
                                                            >
                                                                {day}
                                                            </Text>
                                                            {dayEvents.length > 0 && (
                                                                <Stack gap="xs" mt="xs">
                                                                    {dayEvents.slice(0, 1).map(event => (
                                                                        <Box
                                                                            key={event.id}
                                                                            style={{
                                                                                backgroundColor: getEventTypeColor(event.type),
                                                                                color: 'white',
                                                                                padding: '2px 6px',
                                                                                borderRadius: '6px',
                                                                                fontSize: '10px',
                                                                                fontWeight: 500,
                                                                                textAlign: 'center'
                                                                            }}
                                                                        >
                                                                            {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                                                                        </Box>
                                                                    ))}
                                                                    {dayEvents.length > 1 && (
                                                                        <Text size="xs" c="dimmed" style={{ fontSize: '10px' }}>
                                                                            +{dayEvents.length - 1} autres
                                                                        </Text>
                                                                    )}
                                                                </Stack>
                                                            )}
                                                        </Box>
                                                    );
                                                });
                                            })()}
                                        </SimpleGrid>
                                    )}

                                    {currentView === 'week' && (
                                        <SimpleGrid cols={7} spacing="xs">
                                            {getWeekDates(selectedDate).map((date, index) => {
                                                const isToday = date.toDateString() === new Date().toDateString();
                                                const isClicked = clickedDate && clickedDate.toDateString() === date.toDateString();
                                                const dayEvents = events.filter(event => {
                                                    const eventDate = new Date(event.start_date);
                                                    return eventDate.toDateString() === date.toDateString();
                                                });

                                                return (
                                                    <Box
                                                        key={index}
                                                        p="xs"
                                                        ta="center"
                                                        style={{
                                                            height: 'calc(100vh - 250px)',
                                                            cursor: 'pointer',
                                                            backgroundColor: isClicked ? 'var(--mantine-color-blue-0)' :
                                                                isToday ? 'var(--mantine-color-violet-0)' : 'white',
                                                            border: isClicked ? '2px solid var(--mantine-color-blue-3)' :
                                                                isToday ? '2px solid var(--mantine-color-violet-3)' :
                                                                    '1px solid var(--mantine-color-gray-2)',
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            boxShadow: isClicked ? '0 4px 12px rgba(34, 139, 34, 0.15)' :
                                                                isToday ? '0 4px 12px rgba(139, 69, 19, 0.15)' :
                                                                    '0 2px 4px rgba(0, 0, 0, 0.05)',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onClick={() => handleDateClick(date)}
                                                    >
                                                        <Text
                                                            size="xs"
                                                            fw={isToday ? 600 : 400}
                                                            mb="xs"
                                                        >
                                                            {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                                        </Text>
                                                        <Stack gap="xs">
                                                            {dayEvents.slice(0, 3).map(event => (
                                                                <Box
                                                                    key={event.id}
                                                                    style={{
                                                                        backgroundColor: getEventTypeColor(event.type),
                                                                        color: 'white',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '6px',
                                                                        fontSize: '10px',
                                                                        fontWeight: 500,
                                                                        textAlign: 'center'
                                                                    }}
                                                                >
                                                                    {event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title}
                                                                </Box>
                                                            ))}
                                                            {dayEvents.length > 3 && (
                                                                <Text size="xs" c="dimmed" style={{ fontSize: '10px' }}>
                                                                    +{dayEvents.length - 3} autres
                                                                </Text>
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                );
                                            })}
                                        </SimpleGrid>
                                    )}

                                    {currentView === 'day' && (
                                        <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <Box style={{
                                                flex: 1,
                                                minHeight: 0,
                                                overflow: 'auto',
                                                maxHeight: 'calc(100vh - 265px)'
                                            }}>
                                                {(() => {
                                                    const dayEvents = events.filter(event => {
                                                        const eventDate = new Date(event.start_date);
                                                        return eventDate.toDateString() === selectedDate.toDateString();
                                                    }).sort((a, b) => a.start_date.getTime() - b.start_date.getTime());

                                                    return dayEvents.length > 0 ? (
                                                        <SimpleGrid cols={1} spacing="sm" p="xs">
                                                            {dayEvents.map(event => (
                                                                <Box
                                                                    key={event.id}
                                                                    p="md"
                                                                    style={{
                                                                        backgroundColor: 'white',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid var(--mantine-color-gray-2)',
                                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                                        transition: 'all 0.3s ease',
                                                                        cursor: 'pointer',
                                                                        maxHeight: 'calc((100vh - 300px) / 4)',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                    }}
                                                                >
                                                                    <Group justify="space-between" align="flex-start">
                                                                        <Box style={{ flex: 1 }}>
                                                                            <Text fw={700} size="md" c="dark" mb="sm">
                                                                                {event.title}
                                                                            </Text>
                                                                            <Group gap="md" mb="sm">
                                                                                <Group gap="xs">
                                                                                    <ThemeIcon size="sm" color="blue" variant="light" radius="md">
                                                                                        <IconClock size={12} />
                                                                                    </ThemeIcon>
                                                                                    <Text size="sm" c="dimmed" fw={500}>
                                                                                        {formatTime(event.start_date)} - {formatTime(event.end_date)}
                                                                                    </Text>
                                                                                </Group>
                                                                                {event.location && (
                                                                                    <Group gap="xs">
                                                                                        <ThemeIcon size="sm" color="green" variant="light" radius="md">
                                                                                            <IconMapPin size={12} />
                                                                                        </ThemeIcon>
                                                                                        <Text size="sm" c="dimmed" fw={500}>
                                                                                            {event.location}
                                                                                        </Text>
                                                                                    </Group>
                                                                                )}
                                                                            </Group>
                                                                            {event.description && (
                                                                                <Text size="sm" c="dimmed" mt="sm" lineClamp={2}>
                                                                                    {event.description}
                                                                                </Text>
                                                                            )}
                                                                        </Box>
                                                                        <Group gap="sm">
                                                                            <Box
                                                                                style={{
                                                                                    backgroundColor: getEventTypeColor(event.type),
                                                                                    color: 'white',
                                                                                    padding: '4px 8px',
                                                                                    borderRadius: '8px',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 600
                                                                                }}
                                                                            >
                                                                                {getEventTypeLabel(event.type)}
                                                                            </Box>
                                                                            <ActionIcon
                                                                                size="md"
                                                                                variant="subtle"
                                                                                color="violet"
                                                                                onClick={() => handleEditEvent(event)}
                                                                                style={{ borderRadius: '8px' }}
                                                                            >
                                                                                <IconEdit size={14} />
                                                                            </ActionIcon>
                                                                            <ActionIcon
                                                                                size="md"
                                                                                variant="subtle"
                                                                                color="red"
                                                                                onClick={async () => await handleDeleteEvent(event.id)}
                                                                                style={{ borderRadius: '8px' }}
                                                                            >
                                                                                <IconTrash size={14} />
                                                                            </ActionIcon>
                                                                        </Group>
                                                                    </Group>
                                                                </Box>
                                                            ))}
                                                        </SimpleGrid>
                                                    ) : (
                                                        <Center style={{ height: '100%' }}>
                                                            <Stack align="center" gap="md">
                                                                <ThemeIcon size="xl" color="gray" variant="light" radius="xl">
                                                                    <IconCalendar size={32} />
                                                                </ThemeIcon>
                                                                <Text size="md" c="dimmed" fw={500}>
                                                                    Aucun événement ce jour
                                                                </Text>
                                                            </Stack>
                                                        </Center>
                                                    );
                                                })()}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid.Col>

                        {/* Panneau latéral */}
                        <Grid.Col span={4} style={{ height: '100%', overflow: 'hidden' }} p={0}>
                            <Box style={{ height: '100%', padding: '12px', overflow: 'hidden' }}>
                                {/* Contenu du panneau latéral selon la vue */}
                                {currentView === 'day' ? (
                                    /* Mini-calendrier en vue jour */
                                    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Title order={3} mb="md" c="dark">
                                            Mini-calendrier
                                        </Title>
                                        <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                                            <SimpleGrid cols={7} spacing="xs">
                                                {/* En-têtes des jours */}
                                                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => (
                                                    <Box key={day} ta="center" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '6px' }}>
                                                        <Text size="xs" fw={600} c="dimmed">{day}</Text>
                                                    </Box>
                                                ))}

                                                {/* Jours du mois */}
                                                {(() => {
                                                    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                                                    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                                                    const firstDayOfWeek = firstDay.getDay();
                                                    const daysInMonth = lastDay.getDate();

                                                    const calendarDays = [];

                                                    // Jours du mois précédent
                                                    for (let i = 0; i < firstDayOfWeek; i++) {
                                                        const prevMonthDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), -firstDayOfWeek + i + 1);
                                                        calendarDays.push({
                                                            date: prevMonthDay,
                                                            isCurrentMonth: false,
                                                            day: prevMonthDay.getDate()
                                                        });
                                                    }

                                                    // Jours du mois actuel
                                                    for (let day = 1; day <= daysInMonth; day++) {
                                                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                                                        calendarDays.push({
                                                            date,
                                                            isCurrentMonth: true,
                                                            day
                                                        });
                                                    }

                                                    // Jours du mois suivant
                                                    const remainingDays = 42 - calendarDays.length;
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
                                                        const isSelected = date.toDateString() === selectedDate.toDateString();

                                                        // Vérifier s'il y a des événements ce jour
                                                        const hasEvents = events.some(event => {
                                                            const eventDate = new Date(event.start_date);
                                                            return eventDate.toDateString() === date.toDateString();
                                                        });

                                                        return (
                                                            <Box
                                                                key={i}
                                                                p="xs"
                                                                ta="center"
                                                                style={{
                                                                    minHeight: '32px',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' :
                                                                        isToday ? 'var(--mantine-color-violet-0)' :
                                                                            isCurrentMonth ? 'white' : 'var(--mantine-color-gray-1)',
                                                                    border: isSelected ? '2px solid var(--mantine-color-blue-3)' :
                                                                        isToday ? '2px solid var(--mantine-color-violet-3)' :
                                                                            '1px solid var(--mantine-color-gray-2)',
                                                                    borderRadius: '8px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onClick={() => {
                                                                    setSelectedDate(date);
                                                                    setClickedDate(date);
                                                                }}
                                                            >
                                                                <Text
                                                                    size="xs"
                                                                    c={isCurrentMonth ? 'dark' : 'dimmed'}
                                                                    fw={isToday || isSelected ? 600 : 400}
                                                                >
                                                                    {day}
                                                                </Text>
                                                                {hasEvents && (
                                                                    <Box
                                                                        style={{
                                                                            width: '6px',
                                                                            height: '6px',
                                                                            backgroundColor: 'var(--mantine-color-violet-5)',
                                                                            borderRadius: '50%',
                                                                            margin: '2px auto 0',
                                                                            boxShadow: '0 1px 3px rgba(139, 69, 19, 0.3)'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        );
                                                    });
                                                })()}
                                            </SimpleGrid>
                                        </Box>
                                    </Box>
                                ) : (
                                    /* Événements en vues mois et semaine */
                                    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Title order={3} mb="md" c="dark">
                                            {clickedDate ?
                                                `Événements du ${clickedDate.toLocaleDateString('fr-FR', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}` :
                                                'Événements d\'aujourd\'hui'
                                            }
                                        </Title>
                                        <Box style={{ flex: 1, minHeight: 0 }}>
                                            {(() => {
                                                const displayEvents = clickedDate ?
                                                    events.filter(event => {
                                                        const eventDate = new Date(event.start_date);
                                                        return eventDate.toDateString() === clickedDate.toDateString();
                                                    }) :
                                                    todayEvents;

                                                return displayEvents.length > 0 ? (
                                                    <ScrollArea style={{ height: 'calc(100vh - 235px)', flex: 1 }}>
                                                        <Stack gap="md" p="xs">
                                                            {displayEvents.map(event => (
                                                                <Box
                                                                    key={event.id}
                                                                    p="md"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, white 0%, var(--mantine-color-gray-0) 100%)',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid var(--mantine-color-gray-3)',
                                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                                                                        minHeight: '100px',
                                                                        maxHeight: 'calc((100vh - 300px) / 4)',
                                                                        overflow: 'hidden',
                                                                        transition: 'all 0.3s ease',
                                                                        cursor: 'pointer',
                                                                        position: 'relative'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                                                    }}
                                                                >
                                                                    <Group justify="space-between" align="flex-start" style={{ height: '100%' }}>
                                                                        <Box style={{ flex: 1 }}>
                                                                            <Group gap="sm" mb="xs" align="center">
                                                                                <Text fw={700} size="md" c="dark" lineClamp={1}>
                                                                                    {event.title}
                                                                                </Text>
                                                                                <Box
                                                                                    style={{
                                                                                        backgroundColor: getEventTypeColor(event.type),
                                                                                        color: 'white',
                                                                                        padding: '2px 8px',
                                                                                        borderRadius: '6px',
                                                                                        fontSize: '10px',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.5px'
                                                                                    }}
                                                                                >
                                                                                    {getEventTypeLabel(event.type)}
                                                                                </Box>
                                                                            </Group>

                                                                            <Group gap="md" mb="sm">
                                                                                <Group gap="xs" align="center">
                                                                                    <ThemeIcon size="sm" color="blue" variant="light" radius="md">
                                                                                        <IconClock size={12} />
                                                                                    </ThemeIcon>
                                                                                    <Text size="sm" c="dimmed" fw={500}>
                                                                                        {formatTime(event.start_date)} - {formatTime(event.end_date)}
                                                                                    </Text>
                                                                                </Group>
                                                                                {event.location && (
                                                                                    <Group gap="xs" align="center">
                                                                                        <ThemeIcon size="sm" color="green" variant="light" radius="md">
                                                                                            <IconMapPin size={12} />
                                                                                        </ThemeIcon>
                                                                                        <Text size="sm" c="dimmed" fw={500} lineClamp={1}>
                                                                                            {event.location}
                                                                                        </Text>
                                                                                    </Group>
                                                                                )}
                                                                            </Group>

                                                                            {event.description && (
                                                                                <Text size="sm" c="dimmed" lineClamp={2} style={{
                                                                                    fontStyle: 'italic',
                                                                                    lineHeight: 1.4
                                                                                }}>
                                                                                    {event.description}
                                                                                </Text>
                                                                            )}
                                                                        </Box>

                                                                        <Group gap="xs" style={{ flexShrink: 0 }}>
                                                                            <ActionIcon
                                                                                size="md"
                                                                                variant="subtle"
                                                                                color="violet"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditEvent(event);
                                                                                }}
                                                                                style={{
                                                                                    borderRadius: '4px',
                                                                                    transition: 'all 0.2s ease'
                                                                                }}
                                                                            >
                                                                                <IconEdit size={14} />
                                                                            </ActionIcon>
                                                                            <ActionIcon
                                                                                size="md"
                                                                                variant="subtle"
                                                                                color="red"
                                                                                onClick={async (e) => {
                                                                                    e.stopPropagation();
                                                                                    await handleDeleteEvent(event.id);
                                                                                }}
                                                                                style={{
                                                                                    borderRadius: '4px',
                                                                                    transition: 'all 0.2s ease'
                                                                                }}
                                                                            >
                                                                                <IconTrash size={14} />
                                                                            </ActionIcon>
                                                                        </Group>
                                                                    </Group>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    </ScrollArea>
                                                ) : (
                                                    <Center style={{ height: '100%' }}>
                                                        <Text size="sm" c="dimmed" ta="center">
                                                            {clickedDate ? 'Aucun événement ce jour' : 'Aucun événement aujourd\'hui'}
                                                        </Text>
                                                    </Center>
                                                );
                                            })()}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Grid.Col>
                    </Grid>
                </Box>

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
                                <DateTimePicker
                                    label="Date et heure de début"
                                    placeholder="Sélectionner la date et l'heure de début"
                                    value={formData.startDate ? new Date(formData.startDate) : null}
                                    onChange={(date) => {
                                        if (date) {
                                            let dateTimeValue;
                                            if (typeof date === 'string') {
                                                // Convertir la string en Date puis en format local pour l'affichage
                                                const dateObj = new Date(date);
                                                const year = dateObj.getFullYear();
                                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                const day = String(dateObj.getDate()).padStart(2, '0');
                                                const hours = String(dateObj.getHours()).padStart(2, '0');
                                                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                                                dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                                            } else if (date instanceof Date && !isNaN(date.getTime())) {
                                                // Même logique pour les objets Date
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                                            } else {
                                                dateTimeValue = '';
                                            }
                                            setFormData({
                                                ...formData,
                                                startDate: dateTimeValue
                                            });
                                        } else {
                                            setFormData({ ...formData, startDate: '' });
                                        }
                                    }}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateTimePicker
                                    label="Date et heure de fin"
                                    placeholder="Sélectionner la date et l'heure de fin"
                                    value={formData.endDate ? new Date(formData.endDate) : null}
                                    onChange={(date) => {
                                        if (date) {
                                            let dateTimeValue;
                                            if (typeof date === 'string') {
                                                // Convertir la string en Date puis en format local pour l'affichage
                                                const dateObj = new Date(date);
                                                const year = dateObj.getFullYear();
                                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                const day = String(dateObj.getDate()).padStart(2, '0');
                                                const hours = String(dateObj.getHours()).padStart(2, '0');
                                                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                                                dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                                            } else if (date instanceof Date && !isNaN(date.getTime())) {
                                                // Même logique pour les objets Date
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                                            } else {
                                                dateTimeValue = '';
                                            }
                                            setFormData({
                                                ...formData,
                                                endDate: dateTimeValue
                                            });
                                        } else {
                                            setFormData({ ...formData, endDate: '' });
                                        }
                                    }}
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
                            <Button
                                onClick={handleSaveEvent}
                                color="violet"
                                loading={isCreatingEvent}
                                disabled={isCreatingEvent}
                            >
                                {editingEvent ? 'Modifier' : 'Créer'}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Box>
        </MainLayout>
    );
};

export default CalendarPage;
