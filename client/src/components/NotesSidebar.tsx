import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Stack,
    Text,
    Group,
    ActionIcon,
    TextInput,
    Collapse,
    ThemeIcon,
    Button,
    Divider,
    ScrollArea,
    Menu,
} from '@mantine/core';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    rectIntersection,
    closestCenter
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import {
    IconChevronDown,
    IconChevronRight,
    IconPlus,
    IconFile,
    IconFolder,
    IconFolderOpen,
    IconEdit,
    IconTrash,
    IconDots,
    IconSearch,
    IconHome,
    IconSettings,
    IconFolderPlus,
    IconPencil
} from '@tabler/icons-react';
import type { Page } from '../types';
import { formatTimeAgo } from '../utils/timeUtils';

interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    isOpen?: boolean;
    children?: FileItem[];
    isSelected?: boolean;
    updated_at?: string;
}

interface NotesSidebarProps {
    pages?: Page[];
    selectedPage?: Page | null;
    onPageSelect?: (pageId: string) => void;
    onCreatePage?: () => void;
    onCreateFolder?: () => void;
    onMovePage?: (pageId: string, newParentId: string | null) => void;
    onRenamePage?: (pageId: string, newName: string) => void;
    onDeletePage?: (pageId: string) => void;
}

// Zone droppable invisible pour les zones vides
const EmptyDropZone: React.FC<{ activeId: string | null }> = ({ activeId }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: 'empty-zone',
    });

    return (
        <Box
            ref={setNodeRef}
            style={{
                minHeight: '40px',
                backgroundColor: isOver ? 'var(--mantine-color-violet-1)' : 'transparent',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease',
                border: isOver ? '2px dashed var(--mantine-color-violet-4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '8px'
            }}
        >
            {isOver && (
                <Text size="xs" c="violet" fw={500}>
                    Déposer ici pour mettre à la racine
                </Text>
            )}
        </Box>
    );
};

const NotesSidebar: React.FC<NotesSidebarProps> = ({
    pages = [],
    selectedPage,
    onPageSelect,
    onCreatePage,
    onCreateFolder,
    onMovePage,
    onRenamePage,
    onDeletePage
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Minimum distance before drag starts
            },
        })
    );

    // Fonction pour construire la hiérarchie
    const buildHierarchy = (pages: Page[]): FileItem[] => {
        const pageMap = new Map<string, Page>();
        const rootItems: Page[] = [];

        // Créer une map de toutes les pages avec children initialisés
        pages.forEach(page => {
            pageMap.set(page.id, { ...page, children: [] });
        });

        // Construire la hiérarchie
        pages.forEach(page => {
            if (page.parent_id && pageMap.has(page.parent_id)) {
                const parent = pageMap.get(page.parent_id)!;
                if (!parent.children) parent.children = [];
                parent.children.push(pageMap.get(page.id)!);
            } else {
                // C'est un élément racine
                rootItems.push(pageMap.get(page.id)!);
            }
        });

        // Convertir les pages en FileItems récursivement
        const convertToFileItem = (page: Page): FileItem => ({
            id: page.id,
            name: page.title,
            type: page.type === 'folder' ? 'folder' : 'file',
            isSelected: selectedPage?.id === page.id,
            isOpen: openFolders.has(page.id),
            children: page.children?.map(convertToFileItem) || [],
            updated_at: page.updated_at
        });

        // Trier les éléments racine alphabétiquement avec dossiers en haut
        rootItems.sort((a, b) => {
            // Dossiers en premier
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;

            // Puis tri alphabétique
            return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        });

        // Trier les enfants de chaque dossier alphabétiquement avec dossiers en haut
        const sortChildren = (items: Page[]) => {
            items.sort((a, b) => {
                // Dossiers en premier
                if (a.type === 'folder' && b.type !== 'folder') return -1;
                if (a.type !== 'folder' && b.type === 'folder') return 1;

                // Puis tri alphabétique
                return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
            });
            items.forEach(item => {
                if (item.children && item.children.length > 0) {
                    sortChildren(item.children);
                }
            });
        };

        // Appliquer le tri aux enfants
        pageMap.forEach(page => {
            if (page.children && page.children.length > 0) {
                sortChildren(page.children);
            }
        });

        return rootItems.map(convertToFileItem);
    };

    // Fonction pour filtrer les fichiers basés sur la requête de recherche
    const filterFiles = (items: FileItem[], query: string): FileItem[] => {
        if (!query.trim()) return items;

        const filtered: FileItem[] = [];

        items.forEach(item => {
            const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
            const filteredChildren = item.children ? filterFiles(item.children, query) : [];

            if (matchesQuery || filteredChildren.length > 0) {
                filtered.push({
                    ...item,
                    children: filteredChildren
                });
            }
        });

        return filtered;
    };

    // Construire la hiérarchie des fichiers avec useMemo pour éviter les recalculs inutiles
    const fileItems: FileItem[] = useMemo(() => {
        const hierarchy = buildHierarchy(pages);
        return filterFiles(hierarchy, searchQuery);
    }, [pages, selectedPage?.id, openFolders, searchQuery]);

    // Composant pour les éléments draggables
    const DraggableItem: React.FC<{ item: FileItem; level: number }> = ({ item, level }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            isDragging,
        } = useDraggable({
            id: item.id,
            disabled: item.type === 'folder' // Seuls les fichiers peuvent être déplacés
        });

        const style = {
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <div ref={setNodeRef} style={style} {...attributes}>
                {item.type === 'folder' ? (
                    <DroppableFolder item={item} level={level} listeners={undefined} />
                ) : (
                    renderFileItem(item, level, item.type === 'file' ? listeners : undefined)
                )}
            </div>
        );
    };

    // Gestion du drag-and-drop
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) {
            return;
        }

        const activeItem = findItemById(active.id as string, fileItems);
        if (!activeItem || !onMovePage) return;

        // Seuls les fichiers peuvent être déplacés
        if (activeItem.type === 'folder') return;

        // Trouver l'élément de destination
        const overItem = findItemById(over.id as string, fileItems);


        // Vérifier si on drop sur la zone vide en bas
        if (over.id === 'empty-zone') {
            onMovePage(activeItem.id, null);
            return;
        }

        if (!overItem) {
            // Drop sur une zone vide - mettre à la racine
            onMovePage(activeItem.id, null);
            return;
        }

        if (overItem.type === 'folder') {
            // Drop sur un dossier - mettre dans le dossier
            onMovePage(activeItem.id, overItem.id);

            // Ouvrir automatiquement le dossier de destination
            setOpenFolders(prev => new Set([...prev, overItem.id]));
        } else {
            // Drop sur un fichier - mettre à la racine (sortir du dossier)
            onMovePage(activeItem.id, null);
        }
    };

    // Fonction utilitaire pour trouver un élément par ID
    const findItemById = (id: string, items: FileItem[]): FileItem | null => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.children) {
                const found = findItemById(id, item.children);
                if (found) return found;
            }
        }
        return null;
    };

    // Fonction utilitaire pour trouver le parent d'un élément
    const findParentById = (id: string, items: FileItem[], parent: FileItem | null = null): FileItem | null => {
        for (const item of items) {
            if (item.id === id) return parent;
            if (item.children) {
                const found = findParentById(id, item.children, item);
                if (found) return found;
            }
        }
        return null;
    };

    // Fonction utilitaire pour trouver les frères et sœurs d'un élément
    const getSiblings = (id: string, items: FileItem[]): FileItem[] => {
        const parent = findParentById(id, items);
        if (parent && parent.children) {
            return parent.children;
        }
        // Si pas de parent, retourner les éléments racine
        return items;
    };

    const handleFileClick = (item: FileItem) => {
        if (item.type === 'folder') {
            // Toggle du dossier
            const newOpenFolders = new Set(openFolders);
            if (newOpenFolders.has(item.id)) {
                newOpenFolders.delete(item.id);
            } else {
                newOpenFolders.add(item.id);
            }
            setOpenFolders(newOpenFolders);
        } else if (item.type === 'file' && onPageSelect) {
            onPageSelect(item.id);
        }
    };

    // Composant droppable pour les dossiers
    const DroppableFolder: React.FC<{ item: FileItem; level: number; listeners?: any }> = ({ item, level, listeners }) => {
        const { isOver, setNodeRef } = useDroppable({
            id: item.id,
            disabled: false // Permettre le drop sur tous les éléments
        });

        return (
            <div ref={setNodeRef}>
                {renderFileItem(item, level, listeners, isOver)}
            </div>
        );
    };

    const renderFileItem = (item: FileItem, level: number = 0, listeners?: any, isOver: boolean = false) => {
        const isFolder = item.type === 'folder';
        const hasChildren = item.children && item.children.length > 0;
        const isSelected = item.isSelected;

        return (
            <Box key={item.id} id={`sortable-${item.id}`}>
                <Group
                    gap="xs"
                    p="xs"
                    style={{
                        paddingLeft: `${level * 16 + 8}px`,
                        backgroundColor: isSelected
                            ? 'var(--mantine-color-violet-1)'
                            : (isOver && isFolder ? 'var(--mantine-color-violet-0)' : 'transparent'),
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        marginLeft: level > 0 ? `${level * 4}px` : '0px',
                        position: 'relative',
                        border: isOver && isFolder ? '2px dashed var(--mantine-color-violet-4)' : 'none'
                    }}
                    onClick={() => handleFileClick(item)}
                    {...listeners}
                >

                    {isFolder ? (
                        <ThemeIcon size="sm" color="violet" variant="light" radius="sm">
                            {item.isOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                        </ThemeIcon>
                    ) : (
                        <ThemeIcon size="sm" color="gray" variant="light" radius="sm">
                            <IconFile size={12} />
                        </ThemeIcon>
                    )}


                    <Box style={{ flex: 1 }}>
                        <Text
                            size="sm"
                            c={isSelected ? 'violet' : 'dimmed'}
                            style={{ lineHeight: 1.2 }}
                        >
                            {item.name}
                        </Text>
                        {item.type === 'file' && item.updated_at && (
                            <Text
                                size="xs"
                                c="dimmed"
                                style={{ lineHeight: 1 }}
                            >
                                {formatTimeAgo(item.updated_at)}
                            </Text>
                        )}
                    </Box>

                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon
                                variant="transparent"
                                size="sm"
                                color={isSelected ? "violet" : "gray"}
                                style={{
                                    opacity: isSelected ? 1 : 0.6,
                                    transition: 'opacity 0.2s ease'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Empêcher la propagation vers le drag-and-drop
                                }}
                            >
                                <IconDots size={14} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconPencil size={14} />}
                                onClick={() => onRenamePage?.(item.id, item.name)}
                            >
                                Renommer
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => onDeletePage?.(item.id)}
                            >
                                Supprimer
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                {isFolder && hasChildren && item.isOpen && (
                    <Box
                        style={{
                            borderLeft: '2px solid var(--mantine-color-gray-2)',
                            marginLeft: `${level * 24 + 28}px`,
                            paddingLeft: '8px',
                            marginTop: '4px',
                            backgroundColor: 'var(--mantine-color-gray-0)',
                            borderRadius: '0 4px 4px 0'
                        }}
                    >
                        {item.children!.map(child => (
                            <DraggableItem key={child.id} item={child} level={level + 1} />
                        ))}
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Box
            w={320}
            h="100vh"
            style={{
                backgroundColor: 'white',
                borderRight: '1px solid var(--mantine-color-gray-3)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                <Group justify="center" mb="md">
                    <Group gap="xs">
                        <ThemeIcon size="sm" color="violet" radius="sm">
                            <IconFile size={16} />
                        </ThemeIcon>
                        <Text fw={600} c="dark" size="sm">
                            Pages
                        </Text>
                    </Group>
                </Group>

                <TextInput
                    placeholder="Rechercher..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="sm"
                    styles={{
                        input: {
                            backgroundColor: 'var(--mantine-color-gray-0)',
                            border: '1px solid var(--mantine-color-gray-3)',
                            color: 'black'
                        }
                    }}
                />
            </Box>

            {/* Arborescence des fichiers */}
            <ScrollArea
                style={{
                    flex: 1,
                    backgroundColor: activeId ? 'var(--mantine-color-violet-0)' : 'transparent',
                    transition: 'background-color 0.2s ease'
                }}
                p="md"
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <Stack gap={4}>
                        {fileItems.length === 0 && !searchQuery.trim() && (
                            <EmptyDropZone activeId={activeId} />
                        )}
                        {fileItems.length === 0 && searchQuery.trim() && (
                            <Box p="md" style={{ textAlign: 'center' }}>
                                <Text c="dimmed" size="sm">
                                    Aucun résultat pour "{searchQuery}"
                                </Text>
                            </Box>
                        )}
                        {fileItems.map(item => (
                            <DraggableItem key={item.id} item={item} level={0} />
                        ))}
                        {fileItems.length > 0 && (
                            <EmptyDropZone activeId={activeId} />
                        )}
                    </Stack>
                </DndContext>
            </ScrollArea>

            {/* Actions rapides */}
            <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                <Button.Group style={{ width: '100%' }}>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        variant="light"
                        size="sm"
                        color="blue"
                        onClick={() => onCreatePage?.()}
                        style={{ flex: 1 }}
                    >
                        Page
                    </Button>
                    <Button
                        leftSection={<IconFolderPlus size={16} />}
                        variant="light"
                        size="sm"
                        color="blue"
                        onClick={() => onCreateFolder?.()}
                        style={{ flex: 1 }}
                    >
                        Dossier
                    </Button>
                </Button.Group>
            </Box>
        </Box>
    );
};

export default NotesSidebar;

