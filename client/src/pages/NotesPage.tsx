import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, Button, Stack, Title } from '@mantine/core';
import { IconPlus, IconFolderPlus } from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';
import NotesSidebar from '../components/NotesSidebar';
import NotesEditor from '../components/NotesEditor';
import NotesSidebarSkeleton from '../components/NotesSidebarSkeleton';
import NotesEditorSkeleton from '../components/NotesEditorSkeleton';
import NotesCreateItemModal from '../components/NotesCreateItemModal';
import NotesRenameModal from '../components/NotesRenameModal';
import NotesDeleteConfirmModal from '../components/NotesDeleteConfirmModal';
import pageService from '../services/pageService';
import type { Page } from '../types';
import { useUserContext } from '../contexts/UserContext';
import { useNavbarContext } from '../contexts/NavbarContext';
import { convertEditorContentToPDF } from '../utils/pdfUtils';

const NotesPage: React.FC = () => {
    const [selectedNote, setSelectedNote] = useState<Page | null>(null);
    const [editorContent, setEditorContent] = useState<any>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [isLoadingPages, setIsLoadingPages] = useState(true);
    const [isLoadingEditor, setIsLoadingEditor] = useState(false);

    // États pour les modaux de création
    const [createPageModalOpened, setCreatePageModalOpened] = useState<boolean>(false);
    const [createFolderModalOpened, setCreateFolderModalOpened] = useState<boolean>(false);
    const [currentParentId, setCurrentParentId] = useState<string | undefined>(undefined);
    const [isCreating, setIsCreating] = useState<boolean>(false);

    // États pour les modaux de renommage et suppression
    const [renameModalOpened, setRenameModalOpened] = useState<boolean>(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState<boolean>(false);
    const [selectedPageForAction, setSelectedPageForAction] = useState<Page | null>(null);
    const [isRenaming, setIsRenaming] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Ref pour l'éditeur
    const editorRef = useRef<{ save: () => Promise<any> }>(null);

    const { user, isLoading: userLoading } = useUserContext();
    const { isOpen: isNavbarOpen } = useNavbarContext();

    // Charger les pages au montage du composant
    useEffect(() => {
        if (user) {
            loadPages();
        } else {
            setIsLoadingPages(false);
        }
    }, [user]);

    const loadPages = async () => {
        setIsLoadingPages(true);
        try {
            // Appel à l'API réelle
            const userPages = await pageService.getPages();
            setPages(userPages);
        } catch (error) {
            // En cas d'erreur, utiliser des données par défaut
            setPages([]);
        } finally {
            setIsLoadingPages(false);
        }
    };

    const handleNoteSelect = async (pageId: string) => {
        // Éviter de recharger la même page
        if (selectedNote?.id === pageId) {
            return;
        }

        // D'abord, essayer de trouver la page dans la liste locale
        const localPage = pages.find(p => p.id === pageId);
        if (localPage) {
            setSelectedNote(localPage);
            if (localPage.type === 'page') {
                setEditorContent(localPage.content);
            } else {
                setEditorContent(null);
            }
            return;
        }

        // Si pas trouvée localement, charger depuis l'API
        try {
            setIsLoadingEditor(true);
            const page = await pageService.getPageById(pageId);
            setSelectedNote(page);

            if (page.type === 'page') {
                setEditorContent(page.content);
            } else {
                setEditorContent(null);
            }
        } catch (error) {
            // Error loading page
        } finally {
            setIsLoadingEditor(false);
        }
    };

    const handleSave = async (content: any) => {
        if (!selectedNote || !user) return;

        try {
            // Appel à l'API réelle
            const updatedPage = await pageService.updatePage(selectedNote.id, {
                content: content,
                updated_at: new Date().toISOString()
            });

            // Mettre à jour la page sélectionnée
            setSelectedNote(updatedPage);

            // Mettre à jour dans la liste
            setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));

        } catch (error) {
            // Error saving
        }
    };

    // Ouvrir le modal pour créer une page
    const openCreatePageModal = (parentId?: string) => {
        setCurrentParentId(parentId);
        setCreatePageModalOpened(true);
    };

    // Créer une nouvelle page avec le nom choisi
    const createNewPage = async (title: string) => {
        if (!user?.id) {
            return;
        }

        setIsCreating(true);
        try {
            // Fonction pour extraire l'ID correctement
            const extractId = (value: any): string => {
                if (typeof value === 'string') return value;
                if (value && typeof value === 'object' && value.id) return value.id;
                return '';
            };

            const userId = extractId(user.id);
            const parentId = currentParentId ? extractId(currentParentId) : null;

            // Calculer l'order_index pour la nouvelle page
            const siblings = pages.filter(p => p.parent_id === currentParentId);
            const maxOrderIndex = siblings.length > 0 ? Math.max(...siblings.map(p => p.order_index || 0)) : -1;

            // Appel à l'API réelle
            const newPage = await pageService.createPage({
                title: title,
                content: {
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: title,
                                level: 1,
                            },
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: '',
                            },
                        },
                    ],
                },
                user_id: userId,
                created_by: userId,
                type: 'page',
                parent_id: parentId,
                order_index: maxOrderIndex + 1
            });

            // Ajouter à la liste
            setPages([...pages, newPage]);
            setSelectedNote(newPage);
            setEditorContent(newPage.content);


            // Fermer le modal
            setCreatePageModalOpened(false);
            setCurrentParentId(undefined);
        } catch (error) {
            // Error creating page
        } finally {
            setIsCreating(false);
        }
    };

    // Ouvrir le modal pour créer un dossier
    const openCreateFolderModal = (parentId?: string) => {
        setCurrentParentId(parentId);
        setCreateFolderModalOpened(true);
    };

    // Créer un nouveau dossier avec le nom choisi
    const createNewFolder = async (title: string) => {
        if (!user?.id) {
            return;
        }

        setIsCreating(true);
        try {
            // Fonction pour extraire l'ID correctement
            const extractId = (value: any): string => {
                if (typeof value === 'string') return value;
                if (value && typeof value === 'object' && value.id) return value.id;
                return '';
            };

            const userId = extractId(user.id);
            const parentId = currentParentId ? extractId(currentParentId) : null;

            // Calculer l'order_index pour le nouveau dossier
            const siblings = pages.filter(p => p.parent_id === currentParentId);
            const maxOrderIndex = siblings.length > 0 ? Math.max(...siblings.map(p => p.order_index || 0)) : -1;

            // Appel à l'API réelle pour créer un dossier
            const newFolder = await pageService.createPage({
                title: title,
                content: null, // Les dossiers n'ont pas de contenu
                user_id: userId,
                created_by: userId,
                type: 'folder',
                parent_id: parentId,
                order_index: maxOrderIndex + 1
            });

            // Ajouter à la liste
            setPages([...pages, newFolder]);


            // Fermer le modal
            setCreateFolderModalOpened(false);
            setCurrentParentId(undefined);
        } catch (error) {
            // Error creating folder
        } finally {
            setIsCreating(false);
        }
    };

    // Fonction pour déplacer une page
    const handleMovePage = async (pageId: string, newParentId: string | null) => {
        try {

            // Mettre à jour l'état local immédiatement pour un feedback visuel instantané
            setPages(prevPages => {
                const updatedPages = prevPages.map(page =>
                    page.id === pageId
                        ? { ...page, parent_id: newParentId, updated_at: new Date().toISOString() }
                        : page
                );

                // Trier alphabétiquement avec dossiers en premier
                return updatedPages.sort((a, b) => {
                    if (a.type === 'folder' && b.type !== 'folder') return -1;
                    if (a.type !== 'folder' && b.type === 'folder') return 1;
                    return a.title.localeCompare(b.title);
                });
            });

            // Mettre à jour l'API en arrière-plan
            const updatedPage = await pageService.updatePage(pageId, {
                parent_id: newParentId
            });

        } catch (error) {
            // En cas d'erreur, recharger pour revenir à l'état correct
            loadPages();
        }
    };

    // Fonction pour ouvrir le modal de renommage
    const handleRename = (pageId: string, currentName: string) => {
        const page = pages.find(p => p.id === pageId);
        if (page) {
            setSelectedPageForAction(page);
            setRenameModalOpened(true);
        }
    };

    // Fonction pour renommer une page
    const handleConfirmRename = async (newName: string) => {
        if (!selectedPageForAction) return;

        setIsRenaming(true);
        try {
            const updatedPage = await pageService.updatePage(selectedPageForAction.id, {
                title: newName
            });

            // Mettre à jour dans la liste
            setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));

            // Si c'est la page sélectionnée, la mettre à jour aussi
            if (selectedNote?.id === updatedPage.id) {
                setSelectedNote(updatedPage);
            }

            setRenameModalOpened(false);
            setSelectedPageForAction(null);
        } catch (error) {
            // Error renaming page
        } finally {
            setIsRenaming(false);
        }
    };

    // Fonction pour ouvrir le modal de suppression
    const handleDelete = (pageId: string) => {
        const page = pages.find(p => p.id === pageId);
        if (page) {
            setSelectedPageForAction(page);
            setDeleteModalOpened(true);
        }
    };

    // Fonction pour supprimer une page
    const handleConfirmDelete = async () => {
        if (!selectedPageForAction) return;

        setIsDeleting(true);
        try {
            await pageService.deletePage(selectedPageForAction.id);

            // Retirer de la liste
            setPages(pages.filter(p => p.id !== selectedPageForAction.id));

            // Si c'est la page sélectionnée, la désélectionner
            if (selectedNote?.id === selectedPageForAction.id) {
                setSelectedNote(null);
                setEditorContent(null);
            }

            setDeleteModalOpened(false);
            setSelectedPageForAction(null);
        } catch (error) {
            // Error deleting page
        } finally {
            setIsDeleting(false);
        }
    };

    // Fonction pour télécharger la page en PDF
    const handleDownloadPDF = async () => {
        if (!selectedNote || !user) return;

        try {
            // Forcer la sauvegarde du contenu actuel de l'éditeur avant l'export
            if (editorRef.current) {
                const currentContent = await editorRef.current.save();
                // Vérifier si c'est du format Editor.js (blocks)
                if (currentContent && currentContent.blocks) {
                    // Sauvegarder le contenu mis à jour
                    await handleSave(currentContent);
                    // Utiliser le contenu fraîchement sauvegardé pour le PDF
                    convertEditorContentToPDF(currentContent, selectedNote.title);
                } else {
                    // Si pas de contenu valide, utiliser le contenu existant
                    convertEditorContentToPDF(editorContent, selectedNote.title);
                }
            } else {
                // Si pas d'éditeur, utiliser le contenu existant
                convertEditorContentToPDF(editorContent, selectedNote.title);
            }
        } catch (error) {
            console.error('Erreur lors du téléchargement du PDF:', error);
        }
    };

    // Si l'utilisateur n'est pas connecté
    if (!user && !userLoading) {
        return (
            <Box style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text>Veuillez vous connecter pour accéder à vos pages</Text>
            </Box>
        );
    }

    return (
        <MainLayout authProps={{ isAuthenticated: !!user, onLogin: () => { }, onLogout: () => { } }}>
            <Box style={{
                height: '100vh',
                display: 'flex',
                position: 'absolute',
                top: 0,
                left: isNavbarOpen ? '280px' : '90px', // Ajuster selon l'état de la sidebar
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0,
                transition: 'left 0.2s ease', // Animation fluide
                overflow: 'hidden'
            }}>
                {/* Sidebar avec skeleton */}
                {isLoadingPages ? (
                    <NotesSidebarSkeleton />
                ) : (
                    <NotesSidebar
                        pages={pages}
                        selectedPage={selectedNote}
                        onPageSelect={handleNoteSelect}
                        onCreatePage={openCreatePageModal}
                        onCreateFolder={openCreateFolderModal}
                        onMovePage={handleMovePage}
                        onRenamePage={handleRename}
                        onDeletePage={handleDelete}
                    />
                )}

                {/* Zone principale avec skeleton pour l'éditeur */}
                <Box style={{ flex: 1, backgroundColor: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {isLoadingEditor ? (
                        <NotesEditorSkeleton />
                    ) : selectedNote && selectedNote.type === 'page' && editorContent ? (
                        <NotesEditor
                            ref={editorRef}
                            key={selectedNote.id} // Key pour forcer le re-render quand la page change
                            content={editorContent}
                            onSave={handleSave}
                            onDelete={() => handleDelete(selectedNote.id)}
                            onRename={async (newTitle: string) => {
                                if (newTitle && newTitle !== selectedNote.title) {
                                    await handleConfirmRename(newTitle);
                                }
                            }}
                            onDownload={handleDownloadPDF}
                            title={selectedNote.title}
                            updatedAt={selectedNote.updated_at}
                        />
                    ) : selectedNote && selectedNote.type === 'folder' ? (
                        <Box
                            style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Stack align="center" gap="xl">
                                <Box style={{ textAlign: 'center' }}>
                                    <Title order={3} c="dimmed" mb="md">
                                        📁 {selectedNote.title}
                                    </Title>
                                    <Text c="dimmed" size="sm" mb="xl">
                                        Ce dossier contient vos pages organisées
                                    </Text>
                                </Box>

                                <Button.Group>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        onClick={() => openCreatePageModal(selectedNote.id)}
                                        variant="light"
                                        color="blue"
                                    >
                                        Nouvelle page
                                    </Button>
                                    <Button
                                        leftSection={<IconFolderPlus size={16} />}
                                        onClick={() => openCreateFolderModal(selectedNote.id)}
                                        variant="light"
                                        color="blue"
                                    >
                                        Nouveau dossier
                                    </Button>
                                </Button.Group>
                            </Stack>
                        </Box>
                    ) : selectedNote ? (
                        <Box p="xl" style={{ textAlign: 'center', marginTop: '50px' }}>
                            <Text>Chargement de l'éditeur...</Text>
                        </Box>
                    ) : pages.length === 0 && !isLoadingPages && user ? (
                        <Box
                            style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Stack align="center" gap="xl">
                                <Box style={{ textAlign: 'center' }}>
                                    <Title order={3} c="dimmed" mb="md">
                                        Commencez votre aventure
                                    </Title>
                                    <Text c="dimmed" size="sm" mb="xl">
                                        Créez votre première page pour organiser vos idées et notes
                                    </Text>
                                </Box>

                                <Button
                                    leftSection={<IconPlus size={20} />}
                                    onClick={() => openCreatePageModal()}
                                    size="lg"
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                                    style={{
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                        border: 'none'
                                    }}
                                >
                                    Créer votre première page
                                </Button>
                            </Stack>
                        </Box>
                    ) : !isLoadingPages ? (
                        <Box p="xl" style={{ textAlign: 'center', marginTop: '50px' }}>
                            <Text size="sm" c="dimmed">Sélectionnez une page dans la sidebar</Text>
                        </Box>
                    ) : null}
                </Box>
            </Box>

            {/* Modaux de création */}
            <NotesCreateItemModal
                opened={createPageModalOpened}
                onClose={() => setCreatePageModalOpened(false)}
                onConfirm={createNewPage}
                type="page"
                loading={isCreating}
            />

            <NotesCreateItemModal
                opened={createFolderModalOpened}
                onClose={() => setCreateFolderModalOpened(false)}
                onConfirm={createNewFolder}
                type="folder"
                loading={isCreating}
            />

            {/* Modal de renommage */}
            <NotesRenameModal
                opened={renameModalOpened}
                onClose={() => {
                    setRenameModalOpened(false);
                    setSelectedPageForAction(null);
                }}
                onConfirm={handleConfirmRename}
                currentName={selectedPageForAction?.title || ''}
                itemType={selectedPageForAction?.type === 'folder' ? 'folder' : 'page'}
                loading={isRenaming}
            />

            {/* Modal de confirmation de suppression */}
            <NotesDeleteConfirmModal
                opened={deleteModalOpened}
                onClose={() => {
                    setDeleteModalOpened(false);
                    setSelectedPageForAction(null);
                }}
                onConfirm={handleConfirmDelete}
                itemName={selectedPageForAction?.title || ''}
                itemType={selectedPageForAction?.type === 'folder' ? 'folder' : 'page'}
                loading={isDeleting}
            />
        </MainLayout>
    );
};

export default NotesPage;
