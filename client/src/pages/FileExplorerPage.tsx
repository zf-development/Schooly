import React, { useState, useEffect, useRef } from 'react';
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
    Anchor,
    ScrollArea,
    Flex,
    Tabs,
    Image,
    Avatar,
    Timeline,
    RingProgress,
    Progress as MantineProgress,
    Collapse,
    UnstyledButton,
    HoverCard,
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
    IconChevronRight,
    IconCopy,
    IconArrowRight,
    IconEye,
    IconStar,
    IconClock,
    IconUsers,
    IconDatabase,
    IconSettings,
    IconRefresh,
    IconDragDrop,
    IconLayoutSidebar,
    IconTimeline,
    IconPhoto as IconGallery,
    IconTable,
    IconCalendar,
    IconTag,
    IconHeart,
    IconBookmark,
    IconArchive,
    IconLock,
    IconExternalLink,
    IconMaximize,
    IconMinimize,
    IconX,
    IconCheck,
    IconAlertCircle,
    IconInfoCircle,
    IconChevronDown,
    IconChevronUp,
    IconGripVertical,
    IconPalette,
    IconAdjustments,
    IconZoomIn,
    IconZoomOut,
    IconRotateClockwise,
    IconFlipHorizontal,
    IconFlipVertical
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
    tags?: string[];
    isStarred?: boolean;
    isArchived?: boolean;
    thumbnail?: string;
    description?: string;
}

interface Folder {
    id: string;
    name: string;
    path: string;
    parentId?: string;
    createdAt: Date;
    modifiedAt: Date;
    owner: string;
    color?: string;
    icon?: string;
    description?: string;
    itemCount?: number;
}

const FileExplorerPage: React.FC = () => {
    const { user, isLoading } = useUserContext();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'gallery'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadModalOpened, setUploadModalOpened] = useState(false);
    const [folderModalOpened, setFolderModalOpened] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Données d'exemple enrichies
    useEffect(() => {
        const sampleFiles: FileItem[] = [
            {
                id: '1',
                name: 'Rapport_Projet_Final.pdf',
                type: 'file',
                size: 2048576,
                mimeType: 'application/pdf',
                path: '/Documents/Rapport_Projet_Final.pdf',
                createdAt: new Date('2024-11-01'),
                modifiedAt: new Date('2024-11-15'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'read',
                tags: ['rapport', 'projet', 'important'],
                isStarred: true,
                description: 'Rapport final du projet de fin d\'études'
            },
            {
                id: '2',
                name: 'Presentation_Client.pptx',
                type: 'file',
                size: 5242880,
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                path: '/Documents/Presentation_Client.pptx',
                createdAt: new Date('2024-11-10'),
                modifiedAt: new Date('2024-11-12'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['présentation', 'client'],
                isStarred: false,
                description: 'Présentation pour la réunion client'
            },
            {
                id: '3',
                name: 'Code_Project_v2.zip',
                type: 'file',
                size: 10485760,
                mimeType: 'application/zip',
                path: '/Projects/Code_Project_v2.zip',
                createdAt: new Date('2024-11-05'),
                modifiedAt: new Date('2024-11-14'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'admin',
                tags: ['code', 'projet', 'archive'],
                isStarred: true,
                description: 'Archive du projet de développement'
            },
            {
                id: '4',
                name: 'Screenshot_2024.png',
                type: 'file',
                size: 1024000,
                mimeType: 'image/png',
                path: '/Images/Screenshot_2024.png',
                createdAt: new Date('2024-11-20'),
                modifiedAt: new Date('2024-11-20'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['screenshot', 'image'],
                isStarred: false,
                thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
            },
            {
                id: '5',
                name: 'Video_Demo.mp4',
                type: 'file',
                size: 52428800,
                mimeType: 'video/mp4',
                path: '/Videos/Video_Demo.mp4',
                createdAt: new Date('2024-11-22'),
                modifiedAt: new Date('2024-11-22'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['vidéo', 'démo'],
                isStarred: false,
                description: 'Démonstration du produit'
            },
            // Fichiers supplémentaires pour le scroll
            {
                id: '6',
                name: 'Document_Important.docx',
                type: 'file',
                size: 1536000,
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                path: '/Documents/Document_Important.docx',
                createdAt: new Date('2024-11-18'),
                modifiedAt: new Date('2024-11-18'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'read',
                tags: ['document', 'important'],
                isStarred: true,
                description: 'Document important pour le projet'
            },
            {
                id: '7',
                name: 'Image_Logo.png',
                type: 'file',
                size: 512000,
                mimeType: 'image/png',
                path: '/Images/Image_Logo.png',
                createdAt: new Date('2024-11-19'),
                modifiedAt: new Date('2024-11-19'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['logo', 'image'],
                isStarred: false,
                thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'
            },
            {
                id: '8',
                name: 'Script_Backup.sql',
                type: 'file',
                size: 256000,
                mimeType: 'application/sql',
                path: '/Database/Script_Backup.sql',
                createdAt: new Date('2024-11-16'),
                modifiedAt: new Date('2024-11-16'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['sql', 'database', 'backup'],
                isStarred: false,
                description: 'Script de sauvegarde de la base de données'
            },
            {
                id: '9',
                name: 'Configuration.json',
                type: 'file',
                size: 12800,
                mimeType: 'application/json',
                path: '/Config/Configuration.json',
                createdAt: new Date('2024-11-17'),
                modifiedAt: new Date('2024-11-17'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['config', 'json'],
                isStarred: false,
                description: 'Fichier de configuration de l\'application'
            },
            {
                id: '10',
                name: 'Photo_Equipe.jpg',
                type: 'file',
                size: 2048000,
                mimeType: 'image/jpeg',
                path: '/Images/Photo_Equipe.jpg',
                createdAt: new Date('2024-11-21'),
                modifiedAt: new Date('2024-11-21'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'read',
                tags: ['photo', 'équipe'],
                isStarred: true,
                thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop'
            },
            {
                id: '11',
                name: 'Rapport_Mensuel.xlsx',
                type: 'file',
                size: 768000,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                path: '/Reports/Rapport_Mensuel.xlsx',
                createdAt: new Date('2024-11-14'),
                modifiedAt: new Date('2024-11-14'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['rapport', 'excel', 'mensuel'],
                isStarred: false,
                description: 'Rapport mensuel des performances'
            },
            {
                id: '12',
                name: 'Archive_Ancien.zip',
                type: 'file',
                size: 15728640,
                mimeType: 'application/zip',
                path: '/Archives/Archive_Ancien.zip',
                createdAt: new Date('2024-10-30'),
                modifiedAt: new Date('2024-10-30'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'read',
                tags: ['archive', 'ancien'],
                isStarred: false,
                description: 'Archive des anciens fichiers'
            },
            {
                id: '13',
                name: 'Diagramme_Architecture.drawio',
                type: 'file',
                size: 384000,
                mimeType: 'application/xml',
                path: '/Diagrams/Diagramme_Architecture.drawio',
                createdAt: new Date('2024-11-13'),
                modifiedAt: new Date('2024-11-13'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'read',
                tags: ['diagramme', 'architecture'],
                isStarred: true,
                description: 'Diagramme de l\'architecture du système'
            },
            {
                id: '14',
                name: 'Test_Unitaires.js',
                type: 'file',
                size: 256000,
                mimeType: 'application/javascript',
                path: '/Tests/Test_Unitaires.js',
                createdAt: new Date('2024-11-12'),
                modifiedAt: new Date('2024-11-12'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['test', 'javascript', 'unitaire'],
                isStarred: false,
                description: 'Tests unitaires pour le projet'
            },
            {
                id: '15',
                name: 'Documentation_API.md',
                type: 'file',
                size: 128000,
                mimeType: 'text/markdown',
                path: '/Docs/Documentation_API.md',
                createdAt: new Date('2024-11-11'),
                modifiedAt: new Date('2024-11-11'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'read',
                tags: ['documentation', 'api', 'markdown'],
                isStarred: true,
                description: 'Documentation de l\'API REST'
            },
            {
                id: '16',
                name: 'Image_Graphique.png',
                type: 'file',
                size: 1536000,
                mimeType: 'image/png',
                path: '/Images/Image_Graphique.png',
                createdAt: new Date('2024-11-09'),
                modifiedAt: new Date('2024-11-09'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['graphique', 'image'],
                isStarred: false,
                thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
            },
            {
                id: '17',
                name: 'Base_Donnees.db',
                type: 'file',
                size: 5242880,
                mimeType: 'application/x-sqlite3',
                path: '/Database/Base_Donnees.db',
                createdAt: new Date('2024-11-08'),
                modifiedAt: new Date('2024-11-08'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['database', 'sqlite'],
                isStarred: false,
                description: 'Base de données SQLite locale'
            },
            {
                id: '18',
                name: 'Video_Tutorial.mp4',
                type: 'file',
                size: 104857600,
                mimeType: 'video/mp4',
                path: '/Videos/Video_Tutorial.mp4',
                createdAt: new Date('2024-11-07'),
                modifiedAt: new Date('2024-11-07'),
                owner: user?.id || '',
                isShared: true,
                permissions: 'read',
                tags: ['tutorial', 'vidéo'],
                isStarred: true,
                description: 'Tutoriel vidéo pour l\'utilisation du système'
            },
            {
                id: '19',
                name: 'Logs_Application.log',
                type: 'file',
                size: 1024000,
                mimeType: 'text/plain',
                path: '/Logs/Logs_Application.log',
                createdAt: new Date('2024-11-06'),
                modifiedAt: new Date('2024-11-06'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['logs', 'application'],
                isStarred: false,
                description: 'Fichier de logs de l\'application'
            },
            {
                id: '20',
                name: 'Template_Email.html',
                type: 'file',
                size: 51200,
                mimeType: 'text/html',
                path: '/Templates/Template_Email.html',
                createdAt: new Date('2024-11-05'),
                modifiedAt: new Date('2024-11-05'),
                owner: user?.id || '',
                isShared: false,
                permissions: 'write',
                tags: ['template', 'email', 'html'],
                isStarred: false,
                description: 'Template HTML pour les emails'
            }
        ];

        const sampleFolders: Folder[] = [
            {
                id: 'f1',
                name: 'Documents',
                path: '/Documents',
                createdAt: new Date('2024-10-01'),
                modifiedAt: new Date('2024-11-15'),
                owner: user?.id || '',
                color: 'blue',
                icon: '📁',
                description: 'Documents importants',
                itemCount: 12
            },
            {
                id: 'f2',
                name: 'Projects',
                path: '/Projects',
                createdAt: new Date('2024-10-05'),
                modifiedAt: new Date('2024-11-14'),
                owner: user?.id || '',
                color: 'green',
                icon: '💼',
                description: 'Projets en cours',
                itemCount: 8
            },
            {
                id: 'f3',
                name: 'Images',
                path: '/Images',
                createdAt: new Date('2024-10-10'),
                modifiedAt: new Date('2024-11-10'),
                owner: user?.id || '',
                color: 'orange',
                icon: '🖼️',
                description: 'Photos et images',
                itemCount: 25
            },
            {
                id: 'f4',
                name: 'Videos',
                path: '/Videos',
                createdAt: new Date('2024-10-12'),
                modifiedAt: new Date('2024-11-22'),
                owner: user?.id || '',
                color: 'purple',
                icon: '🎬',
                description: 'Vidéos et démos',
                itemCount: 5
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
        if (mimeType.includes('video/')) return 'purple';
        if (mimeType.includes('application/zip') || mimeType.includes('application/x-rar')) return 'yellow';
        return 'gray';
    };

    const handleUpload = async (files: File[]) => {
        setUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            setUploadProgress(progress);

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
                permissions: 'write',
                tags: [],
                isStarred: false
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
            owner: user.id,
            color: 'blue',
            icon: '📁',
            itemCount: 0
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
        console.log('Téléchargement de:', file.name);
    };

    const handleShare = (file: FileItem) => {
        console.log('Partage de:', file.name);
    };

    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        file.path.startsWith(currentPath)
    );

    const filteredFolders = folders.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        folder.path.startsWith(currentPath) &&
        folder.path !== currentPath
    );

    const getBreadcrumbItems = () => {
        const pathParts = currentPath.split('/').filter(part => part !== '');
        const items = [
            { title: 'Accueil', href: '/', icon: <IconHome size={16} /> }
        ];

        let currentPathAccumulator = '';
        pathParts.forEach((part, index) => {
            currentPathAccumulator += `/${part}`;
            items.push({
                title: part,
                href: currentPathAccumulator,
                icon: <IconFolder size={16} />
            });
        });

        return items;
    };

    const handleBackToParent = () => {
        const pathParts = currentPath.split('/').filter(part => part !== '');
        if (pathParts.length > 0) {
            pathParts.pop();
            setCurrentPath(pathParts.length > 0 ? `/${pathParts.join('/')}` : '/');
        }
    };


    return (
        <MainLayout authProps={{ onLogout: () => {}, onLogin: () => {}, isAuthenticated: true }}>
            <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* En-tête */}
                <Box style={{ padding: '16px 24px' }}>
                    <Group justify="space-between" align="center">
                        <Group>
                            <ThemeIcon size={40} radius="md" color="violet">
                                <IconCloud size={24} />
                            </ThemeIcon>
                            <div>
                                <Title order={1} size="h2" mb={0}>
                                    Gestionnaire de Fichiers
                                </Title>
                                <Text c="dimmed" size="sm">
                                    Gérez vos fichiers et dossiers dans le cloud
                                </Text>
                            </div>
                        </Group>
                    </Group>
                </Box>

                <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Main Content */}
                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Top Bar */}
                        <Box p="md" style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <Group justify="space-between" mb="md">
                                <Group gap="md">
                                    <TextInput
                                        id="search-input"
                                        placeholder="Rechercher dans le cloud..."
                                        leftSection={<IconSearch size={16} />}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: 300 }}
                                        radius="md"
                                        size="sm"
                                    />
                                </Group>

                                <Group gap="xs">
                                    <Button.Group>
                                        <Tooltip label="Vue grille" position="bottom">
                                            <Button
                                                variant={viewMode === 'grid' ? 'filled' : 'light'}
                                                size="sm"
                                                onClick={() => setViewMode('grid')}
                                            >
                                                <IconLayoutGrid size={16} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip label="Vue liste" position="bottom">
                                            <Button
                                                variant={viewMode === 'list' ? 'filled' : 'light'}
                                                size="sm"
                                                onClick={() => setViewMode('list')}
                                            >
                                                <IconList size={16} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip label="Vue chronologique" position="bottom">
                                            <Button
                                                variant={viewMode === 'timeline' ? 'filled' : 'light'}
                                                size="sm"
                                                onClick={() => setViewMode('timeline')}
                                            >
                                                <IconTimeline size={16} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip label="Vue galerie" position="bottom">
                                            <Button
                                                variant={viewMode === 'gallery' ? 'filled' : 'light'}
                                                size="sm"
                                                onClick={() => setViewMode('gallery')}
                                            >
                                                <IconGallery size={16} />
                                            </Button>
                                        </Tooltip>
                                    </Button.Group>

                                    <Button
                                        leftSection={<IconUpload size={16} />}
                                        onClick={() => setUploadModalOpened(true)}
                                        color="violet"
                                        size="sm"
                                    >
                                        Téléverser
                                    </Button>
                                </Group>
                            </Group>

                            {/* Breadcrumb */}
                            <Breadcrumbs>
                                {getBreadcrumbItems().map((item, index) => (
                                    <Anchor
                                        key={index}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (index === 0) {
                                                setCurrentPath('/');
                                            } else {
                                                setCurrentPath(item.href);
                                            }
                                        }}
                                        size="sm"
                                    >
                                        <Group gap="xs">
                                            {item.icon}
                                            {item.title}
                                        </Group>
                                    </Anchor>
                                ))}
                            </Breadcrumbs>
                        </Box>

                        {/* Content Area */}
                        <Box style={{ flex: 1, padding: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {viewMode === 'grid' && (
                                <ScrollArea style={{ flex: 1 }}>
                                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
                                    {/* Bouton de retour si on est dans un dossier */}
                                    {currentPath !== '/' && (
                                        <Card
                                            p="md"
                                            radius="lg"
                                            withBorder
                                            style={{
                                                cursor: 'pointer',
                                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                                border: '1px solid #cbd5e1',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={handleBackToParent}
                                        >
                                            <Stack align="center" gap="sm">
                                                <ThemeIcon size={60} radius="lg" color="gray">
                                                    <IconArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
                                                </ThemeIcon>
                                                <Text size="sm" fw={600} ta="center">
                                                    Retour
                                                </Text>
                                                <Text size="xs" c="dimmed" ta="center">
                                                    Dossier parent
                                                </Text>
                                            </Stack>
                                        </Card>
                                    )}

                                    {filteredFolders.map(folder => (
                                        <Card
                                            key={folder.id}
                                            p="md"
                                            radius="lg"
                                            withBorder
                                            style={{
                                                cursor: 'pointer',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '1px solid #e2e8f0',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => setCurrentPath(folder.path)}
                                        >
                                            <Stack align="center" gap="sm">
                                                <ThemeIcon size={60} radius="lg" color="blue">
                                                    <IconFolder size={24} />
                                                </ThemeIcon>
                                                <Text size="sm" fw={600} ta="center" truncate>
                                                    {folder.name}
                                                </Text>
                                                <Text size="xs" c="dimmed" ta="center">
                                                    {folder.itemCount} éléments
                                                </Text>
                                            </Stack>
                                        </Card>
                                    ))}

                                    {filteredFiles.map(file => (
                                        <Card
                                            key={file.id}
                                            p="md"
                                            radius="lg"
                                            withBorder
                                            style={{
                                                cursor: 'pointer',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '1px solid #e2e8f0',
                                                transition: 'all 0.3s ease',
                                                position: 'relative'
                                            }}
                                            onClick={() => setPreviewFile(file)}
                                        >
                                            <Stack align="center" gap="sm">
                                                {file.thumbnail ? (
                                                    <Image
                                                        src={file.thumbnail}
                                                        alt={file.name}
                                                        height={60}
                                                        width={60}
                                                        radius="md"
                                                        fit="cover"
                                                    />
                                                ) : (
                                                    <ThemeIcon size={60} radius="lg" color={getFileTypeColor(file)}>
                                                        {getFileIcon(file)}
                                                    </ThemeIcon>
                                                )}
                                                
                                                <Text size="sm" fw={600} ta="center" truncate>
                                                    {file.name}
                                                </Text>
                                                
                                                <Group gap="xs" justify="center">
                                                    <Text size="xs" c="dimmed">
                                                        {file.size ? formatFileSize(file.size) : 'N/A'}
                                                    </Text>
                                                    {file.isStarred && <IconStar size={12} color="gold" />}
                                                    {file.isShared && <IconShare size={12} color="green" />}
                                                </Group>
                                            </Stack>
                                        </Card>
                                    ))}
                                    </SimpleGrid>
                                    <Box style={{ height: '20px' }} />
                                </ScrollArea>
                            )}

                            {viewMode === 'list' && (
                                <ScrollArea style={{ flex: 1 }}>
                                    <Stack gap="xs">
                                        {/* Bouton de retour si on est dans un dossier */}
                                        {currentPath !== '/' && (
                                            <Card p="md" radius="md" withBorder>
                                                <Group justify="space-between">
                                                    <Group gap="md">
                                                        <ThemeIcon size={40} radius="md" color="gray">
                                                            <IconArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                                                        </ThemeIcon>
                                                        <Box>
                                                            <Text fw={600}>Retour</Text>
                                                            <Text size="sm" c="dimmed">Dossier parent</Text>
                                                        </Box>
                                                    </Group>
                                                    <ActionIcon variant="subtle" size="sm" onClick={handleBackToParent}>
                                                        <IconChevronRight size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </Card>
                                        )}

                                        {filteredFolders.map(folder => (
                                            <Card key={folder.id} p="md" radius="md" withBorder>
                                                <Group justify="space-between">
                                                    <Group gap="md">
                                                        <ThemeIcon size={40} radius="md" color="blue">
                                                            <IconFolder size={20} />
                                                        </ThemeIcon>
                                                        <Box>
                                                            <Text fw={600}>{folder.name}</Text>
                                                            <Text size="sm" c="dimmed">{folder.description}</Text>
                                                        </Box>
                                                    </Group>
                                                    <Group gap="xs">
                                                        <Text size="sm" c="dimmed">{folder.itemCount} éléments</Text>
                                                        <ActionIcon variant="subtle" size="sm">
                                                            <IconChevronRight size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>
                                            </Card>
                                        ))}

                                        {filteredFiles.map(file => (
                                            <Card key={file.id} p="md" radius="md" withBorder>
                                                <Group justify="space-between">
                                                    <Group gap="md">
                                                        <ThemeIcon size={40} radius="md" color={getFileTypeColor(file)}>
                                                            {getFileIcon(file)}
                                                        </ThemeIcon>
                                                        <Box>
                                                            <Text fw={600}>{file.name}</Text>
                                                            <Group gap="xs">
                                                                <Text size="sm" c="dimmed">
                                                                    {file.size ? formatFileSize(file.size) : 'N/A'}
                                                                </Text>
                                                                <Text size="sm" c="dimmed">•</Text>
                                                                <Text size="sm" c="dimmed">
                                                                    {file.modifiedAt.toLocaleDateString('fr-FR')}
                                                                </Text>
                                                            </Group>
                                                        </Box>
                                                    </Group>
                                                    <Group gap="xs">
                                                        {file.isStarred && <IconStar size={16} color="gold" />}
                                                        {file.isShared && <IconShare size={16} color="green" />}
                                                        <ActionIcon variant="subtle" size="sm">
                                                            <IconDots size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>
                                            </Card>
                                        ))}
                                    </Stack>
                                </ScrollArea>
                            )}

                            {viewMode === 'timeline' && (
                                <ScrollArea style={{ flex: 1 }}>
                                    <Timeline active={-1} bulletSize={24} lineWidth={2}>
                                    {[...filteredFolders.map(f => ({ ...f, type: 'folder' as const })), ...filteredFiles]
                                        .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime())
                                        .map((item, index) => (
                                            <Timeline.Item
                                                key={item.id}
                                                bullet={
                                                    item.type === 'folder' ? (
                                                        <Text size="sm">{(item as any).icon}</Text>
                                                    ) : (
                                                        <ThemeIcon size={20} radius="xl" color={getFileTypeColor(item as FileItem)}>
                                                            {getFileIcon(item as FileItem)}
                                                        </ThemeIcon>
                                                    )
                                                }
                                                title={item.name}
                                            >
                                                <Text size="sm" c="dimmed">
                                                    {item.type === 'folder' ? 'Dossier' : 'Fichier'} • 
                                                    Modifié le {item.modifiedAt.toLocaleDateString('fr-FR')}
                                                </Text>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                    <Box style={{ height: '20px' }} />
                                </ScrollArea>
                            )}

                            {viewMode === 'gallery' && (
                                <ScrollArea style={{ flex: 1 }}>
                                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="md">
                                    {filteredFiles
                                        .filter(file => file.mimeType?.startsWith('image/'))
                                        .map(file => (
                                            <Card
                                                key={file.id}
                                                p={0}
                                                radius="lg"
                                                withBorder
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <Image
                                                    src={file.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'}
                                                    alt={file.name}
                                                    height={200}
                                                    fit="cover"
                                                />
                                                <Box p="sm">
                                                    <Text size="sm" fw={600} truncate>
                                                        {file.name}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {file.size ? formatFileSize(file.size) : 'N/A'}
                                                    </Text>
                                                </Box>
                                            </Card>
                                        ))}
                                    </SimpleGrid>
                                </ScrollArea>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>


            {/* File Preview Modal */}
            <Modal
                opened={!!previewFile}
                onClose={() => setPreviewFile(null)}
                title={previewFile?.name}
                size="lg"
            >
                {previewFile && (
                    <Stack gap="md">
                        {previewFile.thumbnail && (
                            <Image
                                src={previewFile.thumbnail}
                                alt={previewFile.name}
                                height={300}
                                fit="cover"
                                radius="md"
                            />
                        )}
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                                {previewFile.size ? formatFileSize(previewFile.size) : 'N/A'}
                            </Text>
                            <Group gap="xs">
                                <Button size="sm" leftSection={<IconDownload size={16} />}>
                                    Télécharger
                                </Button>
                                <Button size="sm" variant="light" leftSection={<IconShare size={16} />}>
                                    Partager
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Upload Modal */}
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
                            <MantineProgress value={uploadProgress} size="sm" />
                        </Alert>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={() => setUploadModalOpened(false)}>
                            Annuler
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Folder Modal */}
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