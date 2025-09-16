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
    FileInput,
    ActionIcon,
    Tooltip,
    Box,
    SimpleGrid,
    Paper,
    Divider,
    Center,
    Loader,
    Menu,
    Progress,
    Alert,
    Breadcrumbs,
    Anchor
} from '@mantine/core';
import {
    IconCloud,
    IconUpload,
    IconFolder,
    IconFile,
    IconFileText,
    IconFileCode,
    IconPhoto,
    IconFileTypePdf,
    IconDownload,
    IconShare,
    IconTrash,
    IconEdit,
    IconDots,
    IconSearch,
    IconFilter,
    IconLayoutGrid,
    IconList,
    IconPlus,
    IconFolderPlus,
    IconHome,
    IconChevronRight
} from '@tabler/icons-react';
import { useUserContext } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';

interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    mimeType?: string;
    path: string;
    createdAt: Date;
    modifiedAt: Date;
    owner: string;
    isShared?: boolean;
    permissions?: 'read' | 'write' | 'admin';
}

interface Folder {
    id: string;
    name: string;
    path: string;
    parentId?: string;
    createdAt: Date;
    modifiedAt: Date;
    owner: string;
}

const FileExplorerPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadModalOpened, setUploadModalOpened] = useState(false);
    const [folderModalOpened, setFolderModalOpened] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    // Données d'exemple
    useEffect(() => {
        const sampleFiles: FileItem[] = [
            {
                id: '1',
                name: 'Rapport_Projet.pdf',
                type: 'file',
                size: 2048576, // 2MB
                mimeType: 'application/pdf',
                path: '/Documents/Rapport_Projet.pdf',
                createdAt: new Date('2024-11-01'),
                modifiedAt: new Date('2024-11-15'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'read'
            },
            {
                id: '2',
                name: 'Presentation.pptx',
                type: 'file',
                size: 5242880, // 5MB
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                path: '/Documents/Presentation.pptx',
                createdAt: new Date('2024-11-10'),
                modifiedAt: new Date('2024-11-12'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write'
            },
            {
                id: '3',
                name: 'Code_Project.zip',
                type: 'file',
                size: 10485760, // 10MB
                mimeType: 'application/zip',
                path: '/Projects/Code_Project.zip',
                createdAt: new Date('2024-11-05'),
                modifiedAt: new Date('2024-11-14'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'admin'
            },
            {
                id: '4',
                name: 'Notes_Cours.md',
                type: 'file',
                size: 51200, // 50KB
                mimeType: 'text/markdown',
                path: '/Notes/Notes_Cours.md',
                createdAt: new Date('2024-11-08'),
                modifiedAt: new Date('2024-11-16'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write'
            }
        ];

        const sampleFolders: Folder[] = [
            {
                id: 'f1',
                name: 'Documents',
                path: '/Documents',
                createdAt: new Date('2024-10-01'),
                modifiedAt: new Date('2024-11-15'),
                owner: user?.id || ''
            },
            {
                id: 'f2',
                name: 'Projects',
                path: '/Projects',
                createdAt: new Date('2024-10-05'),
                modifiedAt: new Date('2024-11-14'),
                owner: user?.id || ''
            },
            {
                id: 'f3',
                name: 'Notes',
                path: '/Notes',
                createdAt: new Date('2024-10-08'),
                modifiedAt: new Date('2024-11-16'),
                owner: user?.id || ''
            },
            {
                id: 'f4',
                name: 'Images',
                path: '/Images',
                createdAt: new Date('2024-10-10'),
                modifiedAt: new Date('2024-11-10'),
                owner: user?.id || ''
            }
        ];

        setFiles(sampleFiles);
        setFolders(sampleFolders);
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file: FileItem) => {
        if (file.type === 'folder') return <IconFolder size={24} />;
        
        const mimeType = file.mimeType || '';
        if (mimeType.startsWith('image/')) return <IconPhoto size={24} />;
        if (mimeType.includes('pdf')) return <IconFileTypePdf size={24} />;
        if (mimeType.includes('text') || mimeType.includes('document')) return <IconFileText size={24} />;
        if (mimeType.includes('code') || mimeType.includes('script')) return <IconFileCode size={24} />;
        return <IconFile size={24} />;
    };

    const getFileTypeColor = (file: FileItem) => {
        if (file.type === 'folder') return 'blue';
        
        const mimeType = file.mimeType || '';
        if (mimeType.startsWith('image/')) return 'green';
        if (mimeType.includes('pdf')) return 'red';
        if (mimeType.includes('text') || mimeType.includes('document')) return 'blue';
        if (mimeType.includes('code') || mimeType.includes('script')) return 'orange';
        return 'gray';
    };

    const handleUpload = async (files: File[]) => {
        setUploading(true);
        setUploadProgress(0);

        // Simulation d'upload
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            setUploadProgress(progress);

            // Simuler le temps d'upload
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newFile: FileItem = {
                id: Date.now().toString() + i,
                name: file.name,
                type: 'file',
                size: file.size,
                mimeType: file.type,
                path: `${currentPath}${file.name}`,
                createdAt: new Date(),
                modifiedAt: new Date(),
                owner: user.id,
                isShared: false,
                permissions: 'write'
            };

            setFiles(prev => [...prev, newFile]);
        }

        setUploading(false);
        setUploadProgress(0);
        setUploadModalOpened(false);
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;

        const newFolder: Folder = {
            id: Date.now().toString(),
            name: newFolderName,
            path: `${currentPath}${newFolderName}`,
            createdAt: new Date(),
            modifiedAt: new Date(),
            owner: user.id
        };

        setFolders(prev => [...prev, newFolder]);
        setNewFolderName('');
        setFolderModalOpened(false);
    };

    const handleDeleteFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleDeleteFolder = (folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
    };

    const handleDownload = (file: FileItem) => {
        // Simulation de téléchargement
        console.log('Téléchargement de:', file.name);
    };

    const handleShare = (file: FileItem) => {
        // Simulation de partage
        console.log('Partage de:', file.name);
    };

    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        file.path.startsWith(currentPath)
    );

    const filteredFolders = folders.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        folder.path.startsWith(currentPath)
    );

    const breadcrumbItems = currentPath.split('/').filter(Boolean).map((segment, index, array) => {
        const path = '/' + array.slice(0, index + 1).join('/');
        return {
            title: segment,
            href: path
        };
    });

    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
                {/* En-tête */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group>
                        <ThemeIcon size={40} radius="md" color="violet">
                            <IconCloud size={24} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Explorateur de Fichiers
                            </Title>
                            <Text c="dimmed" size="sm">
                                Gérez vos fichiers et dossiers dans le cloud
                            </Text>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            leftSection={<IconFolderPlus size={16} />}
                            onClick={() => setFolderModalOpened(true)}
                            variant="light"
                            color="violet"
                        >
                            Nouveau dossier
                        </Button>
                        <Button
                            leftSection={<IconUpload size={16} />}
                            onClick={() => setUploadModalOpened(true)}
                            color="violet"
                        >
                            Téléverser
                        </Button>
                    </Group>
                </Group>

                {/* Barre de navigation */}
                <Card shadow="sm" padding="md" radius="md" withBorder mb="md">
                    <Group justify="space-between">
                        <Breadcrumbs>
                            <Anchor href="#" onClick={() => setCurrentPath('/')}>
                                <IconHome size={16} />
                            </Anchor>
                            {breadcrumbItems.map((item, index) => (
                                <Anchor
                                    key={index}
                                    href="#"
                                    onClick={() => setCurrentPath(item.href)}
                                >
                                    {item.title}
                                </Anchor>
                            ))}
                        </Breadcrumbs>

                        <Group>
                            <TextInput
                                placeholder="Rechercher des fichiers..."
                                leftSection={<IconSearch size={16} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <ActionIcon
                                variant={viewMode === 'grid' ? 'filled' : 'light'}
                                onClick={() => setViewMode('grid')}
                            >
                                <IconLayoutGrid size={16} />
                            </ActionIcon>
                            <ActionIcon
                                variant={viewMode === 'list' ? 'filled' : 'light'}
                                onClick={() => setViewMode('list')}
                            >
                                <IconList size={16} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Card>

                {/* Contenu principal */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    {viewMode === 'grid' ? (
                        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
                            {/* Dossiers */}
                            {filteredFolders.map(folder => (
                                <Paper
                                    key={folder.id}
                                    p="md"
                                    radius="md"
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid var(--mantine-color-gray-3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--mantine-color-violet-3)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--mantine-color-gray-3)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                    onClick={() => setCurrentPath(folder.path)}
                                >
                                    <Stack align="center" gap="sm">
                                        <ThemeIcon size={48} radius="md" color="blue">
                                            <IconFolder size={24} />
                                        </ThemeIcon>
                                        <Text size="sm" ta="center" fw={500} truncate>
                                            {folder.name}
                                        </Text>
                                        <Text size="xs" c="dimmed" ta="center">
                                            Dossier
                                        </Text>
                                    </Stack>
                                </Paper>
                            ))}

                            {/* Fichiers */}
                            {filteredFiles.map(file => (
                                <Paper
                                    key={file.id}
                                    p="md"
                                    radius="md"
                                    style={{
                                        border: '1px solid var(--mantine-color-gray-3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--mantine-color-violet-3)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--mantine-color-gray-3)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Stack align="center" gap="sm">
                                        <ThemeIcon size={48} radius="md" color={getFileTypeColor(file)}>
                                            {getFileIcon(file)}
                                        </ThemeIcon>
                                        <Text size="sm" ta="center" fw={500} truncate>
                                            {file.name}
                                        </Text>
                                        <Text size="xs" c="dimmed" ta="center">
                                            {file.size ? formatFileSize(file.size) : 'N/A'}
                                        </Text>
                                        <Group gap="xs">
                                            <ActionIcon
                                                size="sm"
                                                variant="light"
                                                onClick={() => handleDownload(file)}
                                            >
                                                <IconDownload size={12} />
                                            </ActionIcon>
                                            <ActionIcon
                                                size="sm"
                                                variant="light"
                                                onClick={() => handleShare(file)}
                                            >
                                                <IconShare size={12} />
                                            </ActionIcon>
                                            <Menu>
                                                <Menu.Target>
                                                    <ActionIcon size="sm" variant="light">
                                                        <IconDots size={12} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item leftSection={<IconEdit size={14} />}>
                                                        Renommer
                                                    </Menu.Item>
                                                    <Menu.Item 
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDeleteFile(file.id)}
                                                    >
                                                        Supprimer
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Stack>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    ) : (
                        <Stack gap="sm">
                            {/* Dossiers en liste */}
                            {filteredFolders.map(folder => (
                                <Paper key={folder.id} p="md" radius="md" withBorder>
                                    <Group justify="space-between" align="center">
                                        <Group>
                                            <ThemeIcon size={32} radius="md" color="blue">
                                                <IconFolder size={16} />
                                            </ThemeIcon>
                                            <div>
                                                <Text fw={500}>{folder.name}</Text>
                                                <Text size="sm" c="dimmed">
                                                    Dossier • Modifié le {folder.modifiedAt.toLocaleDateString('fr-FR')}
                                                </Text>
                                            </div>
                                        </Group>
                                        <Group gap="xs">
                                            <ActionIcon
                                                size="sm"
                                                variant="light"
                                                onClick={() => setCurrentPath(folder.path)}
                                            >
                                                <IconChevronRight size={12} />
                                            </ActionIcon>
                                            <Menu>
                                                <Menu.Target>
                                                    <ActionIcon size="sm" variant="light">
                                                        <IconDots size={12} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item leftSection={<IconEdit size={14} />}>
                                                        Renommer
                                                    </Menu.Item>
                                                    <Menu.Item 
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDeleteFolder(folder.id)}
                                                    >
                                                        Supprimer
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}

                            {/* Fichiers en liste */}
                            {filteredFiles.map(file => (
                                <Paper key={file.id} p="md" radius="md" withBorder>
                                    <Group justify="space-between" align="center">
                                        <Group>
                                            <ThemeIcon size={32} radius="md" color={getFileTypeColor(file)}>
                                                {getFileIcon(file)}
                                            </ThemeIcon>
                                            <div>
                                                <Text fw={500}>{file.name}</Text>
                                                <Text size="sm" c="dimmed">
                                                    {file.size ? formatFileSize(file.size) : 'N/A'} • 
                                                    Modifié le {file.modifiedAt.toLocaleDateString('fr-FR')}
                                                </Text>
                                            </div>
                                        </Group>
                                        <Group gap="xs">
                                            {file.isShared && (
                                                <Badge size="sm" color="green" variant="light">
                                                    Partagé
                                                </Badge>
                                            )}
                                            <ActionIcon
                                                size="sm"
                                                variant="light"
                                                onClick={() => handleDownload(file)}
                                            >
                                                <IconDownload size={12} />
                                            </ActionIcon>
                                            <ActionIcon
                                                size="sm"
                                                variant="light"
                                                onClick={() => handleShare(file)}
                                            >
                                                <IconShare size={12} />
                                            </ActionIcon>
                                            <Menu>
                                                <Menu.Target>
                                                    <ActionIcon size="sm" variant="light">
                                                        <IconDots size={12} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item leftSection={<IconEdit size={14} />}>
                                                        Renommer
                                                    </Menu.Item>
                                                    <Menu.Item 
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDeleteFile(file.id)}
                                                    >
                                                        Supprimer
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}

                    {filteredFiles.length === 0 && filteredFolders.length === 0 && (
                        <Center py="xl">
                            <Stack align="center" gap="md">
                                <ThemeIcon size={64} radius="md" color="gray" variant="light">
                                    <IconFolder size={32} />
                                </ThemeIcon>
                                <Text size="lg" c="dimmed">
                                    {searchTerm ? 'Aucun fichier trouvé' : 'Ce dossier est vide'}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Téléversez des fichiers ou créez un dossier'}
                                </Text>
                            </Stack>
                        </Center>
                    )}
                </Card>

                {/* Modal de téléversement */}
                <Modal
                    opened={uploadModalOpened}
                    onClose={() => setUploadModalOpened(false)}
                    title="Téléverser des fichiers"
                    size="md"
                >
                    <Stack gap="md">
                        <FileInput
                            label="Fichiers"
                            placeholder="Sélectionnez des fichiers"
                            multiple
                            onChange={(files) => {
                                if (files) {
                                    handleUpload(Array.from(files));
                                }
                            }}
                        />

                        {uploading && (
                            <Alert color="blue" title="Téléversement en cours...">
                                <Progress value={uploadProgress} size="sm" />
                            </Alert>
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={() => setUploadModalOpened(false)}>
                                Annuler
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

                {/* Modal de création de dossier */}
                <Modal
                    opened={folderModalOpened}
                    onClose={() => setFolderModalOpened(false)}
                    title="Nouveau dossier"
                    size="sm"
                >
                    <Stack gap="md">
                        <TextInput
                            label="Nom du dossier"
                            placeholder="Nom du dossier"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            required
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={() => setFolderModalOpened(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleCreateFolder} color="violet">
                                Créer
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
        </MainLayout>
    );
};

export default FileExplorerPage;
