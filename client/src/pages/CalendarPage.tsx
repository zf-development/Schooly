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
    IconCheck
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

const CalendarPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [modalOpened, setModalOpened] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(false);

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
            {
                id: '1',
                title: 'Examen de Mathématiques',
                description: 'Examen final de calcul différentiel',
                startDate: new Date(2024, 11, 15, 9, 0),
                endDate: new Date(2024, 11, 15, 12, 0),
                location: 'Salle 201',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '2',
                title: 'Réunion de projet',
                description: 'Discussion sur le projet de fin d\'études',
                startDate: new Date(2024, 11, 18, 14, 0),
                endDate: new Date(2024, 11, 18, 16, 0),
                location: 'Bibliothèque',
                type: 'academic',
                reminder: true,
                createdBy: user?.id || '',
                createdAt: new Date()
            },
            {
                id: '3',
                title: 'Événement institutionnel',
                description: 'Conférence sur l\'innovation',
                startDate: new Date(2024, 11, 20, 18, 0),
                endDate: new Date(2024, 11, 20, 20, 0),
                location: 'Amphithéâtre principal',
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
            <MainLayout>
                <Center h="100vh">
                    <Loader size="lg" />
                </Center>
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout>
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
        <MainLayout>
            <Container size="xl" py="md">
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
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={handleCreateEvent}
                        color="violet"
                    >
                        Nouvel événement
                    </Button>
                </Group>

                <Grid>
                    {/* Calendrier principal */}
                    <Grid.Col span={8}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="md">
                                <Title order={3}>
                                    {selectedDate.toLocaleDateString('fr-FR', { 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </Title>
                                <Group>
                                    <Button variant="light" size="sm">
                                        Précédent
                                    </Button>
                                    <Button variant="light" size="sm">
                                        Suivant
                                    </Button>
                                </Group>
                            </Group>

                            {/* Grille du calendrier */}
                            <SimpleGrid cols={7} spacing="xs">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                                    <Paper key={day} p="xs" ta="center" bg="gray.0">
                                        <Text size="sm" fw={500}>{day}</Text>
                                    </Paper>
                                ))}
                                
                                {/* Jours du mois */}
                                {Array.from({ length: 35 }, (_, i) => {
                                    const day = i - 6; // Commencer à -6 pour aligner
                                    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    const dayEvents = events.filter(event => {
                                        const eventDate = new Date(event.startDate);
                                        return eventDate.toDateString() === date.toDateString();
                                    });

                                    return (
                                        <Paper
                                            key={i}
                                            p="xs"
                                            ta="center"
                                            bg={isToday ? 'violet.0' : isCurrentMonth ? 'white' : 'gray.1'}
                                            style={{ 
                                                minHeight: 80,
                                                cursor: 'pointer',
                                                border: isToday ? '2px solid var(--mantine-color-violet-3)' : '1px solid var(--mantine-color-gray-2)'
                                            }}
                                        >
                                            <Text 
                                                size="sm" 
                                                c={isCurrentMonth ? 'dark' : 'dimmed'}
                                                fw={isToday ? 600 : 400}
                                            >
                                                {day > 0 ? day : ''}
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
                                })}
                            </SimpleGrid>
                        </Card>
                    </Grid.Col>

                    {/* Panneau latéral */}
                    <Grid.Col span={4}>
                        <Stack>
                            {/* Événements d'aujourd'hui */}
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Title order={4} mb="md">
                                    Aujourd'hui
                                </Title>
                                {todayEvents.length > 0 ? (
                                    <Stack gap="sm">
                                        {todayEvents.map(event => (
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
                                                    </Box>
                                                    <Badge size="xs" color={getEventTypeColor(event.type)}>
                                                        {getEventTypeLabel(event.type)}
                                                    </Badge>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Text size="sm" c="dimmed" ta="center">
                                        Aucun événement aujourd'hui
                                    </Text>
                                )}
                            </Card>

                            {/* Événements du mois */}
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Title order={4} mb="md">
                                    Ce mois
                                </Title>
                                {currentMonthEvents.length > 0 ? (
                                    <Stack gap="sm">
                                        {currentMonthEvents.slice(0, 5).map(event => (
                                            <Paper key={event.id} p="sm" bg="gray.0">
                                                <Group justify="space-between" align="flex-start">
                                                    <Box style={{ flex: 1 }}>
                                                        <Text fw={500} size="sm">
                                                            {event.title}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {formatDate(event.startDate)}
                                                        </Text>
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
                                        Aucun événement ce mois
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
            </Container>
        </MainLayout>
    );
};

export default CalendarPage;
