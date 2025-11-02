import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { Box, Group, ActionIcon, Menu, Paper, Stack, Text, Popover, Checkbox } from '@mantine/core';
import {
    IconHeading,
    IconDots,
    IconDownload,
    IconShare,
    IconTrash,
    IconCheckbox,
    IconList,
    IconListNumbers,
    IconQuote,
    IconCode,
    IconTable,
    IconPhoto,
    IconVideo,
} from '@tabler/icons-react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Paragraph from '@editorjs/paragraph';
import Table from '@editorjs/table';
import Image from '@editorjs/image';
import { formatTimeAgo } from '../utils/timeUtils';

interface NotesEditorProps {
    content?: any;
    onSave?: (data: any) => void;
    onDelete?: () => void;
    onRename?: (title: string) => void;
    onDownload?: () => void;
    title?: string;
    updatedAt?: string;
}


// Extension Checklist personnalisée avec Checkbox Mantine
class ChecklistTool {
    private data: { items: Array<{ text: string; checked: boolean }> };

    static get toolbox() {
        return {
            icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L3 7V17H17V7L10 2Z" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
            title: 'Liste de tâches',
        };
    }

    constructor({ data }: any) {
        this.data = {
            items: data?.items || [{ text: '', checked: false }],
        };
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'cdx-checklist';
        wrapper.style.cssText = 'padding: 10px 0;';

        const items = this.data.items || [];
        items.forEach((item: { text: string; checked: boolean }, index: number) => {
            const itemElement = this.createItemElement(item, index);
            wrapper.appendChild(itemElement);
        });

        // Ajouter un nouvel item vide à la fin si nécessaire
        if (items.length === 0 || items[items.length - 1].text.trim() !== '') {
            const newItem = this.createItemElement({ text: '', checked: false }, items.length);
            wrapper.appendChild(newItem);
        }

        return wrapper;
    }

    createItemElement(item: { text: string; checked: boolean }, index: number): HTMLElement {
        const itemElement = document.createElement('div');
        itemElement.className = 'cdx-checklist__item';
        itemElement.style.cssText = 'display: flex; align-items: center; margin: 5px 0; padding: 3px 2px 3px 56px;';

        const checkboxWrapper = document.createElement('label');
        checkboxWrapper.style.cssText = 'display: flex; align-items: center; margin-right: 8px; cursor: pointer; flex-shrink: 0;';

        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.checked = item.checked || false;
        checkboxInput.style.cssText = 'margin: 0; cursor: pointer; width: 16px; height: 16px;';
        checkboxInput.addEventListener('change', (e) => {
            const checked = (e.target as HTMLInputElement).checked;
            if (this.data.items[index]) {
                this.data.items[index].checked = checked;
            }
        });

        const textInput = document.createElement('div');
        textInput.contentEditable = 'true';
        textInput.textContent = item.text || '';
        textInput.className = 'cdx-checklist__item-text';
        textInput.style.cssText = 'flex: 1; min-width: 0; outline: none;';
        textInput.addEventListener('input', () => {
            if (this.data.items[index]) {
                this.data.items[index].text = textInput.textContent || '';
            }
        });
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const newIndex = index + 1;
                this.data.items.splice(newIndex, 0, { text: '', checked: false });
                const wrapper = this.render();
                const currentWrapper = itemElement.parentElement;
                if (currentWrapper && currentWrapper.parentElement) {
                    currentWrapper.parentElement.replaceChild(wrapper, currentWrapper);
                }
            }
            if (e.key === 'Backspace' && textInput.textContent === '' && this.data.items.length > 1) {
                e.preventDefault();
                this.data.items.splice(index, 1);
                const wrapper = this.render();
                const currentWrapper = itemElement.parentElement;
                if (currentWrapper && currentWrapper.parentElement) {
                    currentWrapper.parentElement.replaceChild(wrapper, currentWrapper);
                }
            }
        });

        checkboxWrapper.appendChild(checkboxInput);
        itemElement.appendChild(checkboxWrapper);
        itemElement.appendChild(textInput);

        return itemElement;
    }

    save(blockContent: HTMLElement) {
        const items: Array<{ text: string; checked: boolean }> = [];
        const itemElements = blockContent.querySelectorAll('.cdx-checklist__item');

        itemElements.forEach((itemEl) => {
            const checkbox = itemEl.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const textElement = itemEl.querySelector('.cdx-checklist__item-text') as HTMLElement;
            const text = textElement?.textContent?.trim() || '';
            if (text || checkbox) {
                items.push({
                    text: text,
                    checked: checkbox ? checkbox.checked : false,
                });
            }
        });

        return { items: items.filter(item => item.text || items.length === 1) };
    }

    static get sanitize() {
        return {
            items: {
                text: {},
                checked: {},
            },
        };
    }
}

// Définition des commandes du menu slash
interface SlashCommand {
    title: string;
    description: string;
    icon: React.ReactNode;
    searchTerms: string[];
    command: () => void;
}

// Composant pour le menu slash
const SlashMenuList = ({ items, command, selectedIndex, onItemSelect }: any) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (selectedItemRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const item = selectedItemRef.current;

            const containerTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;
            const itemBottom = itemTop + itemHeight;

            if (itemTop < containerTop) {
                container.scrollTop = itemTop - 8;
            } else if (itemBottom > containerTop + containerHeight) {
                container.scrollTop = itemBottom - containerHeight + 8;
            }
        }
    }, [selectedIndex]);

    const setSelectedItemRef = useCallback((element: HTMLDivElement | null, index: number) => {
        if (index === selectedIndex) {
            selectedItemRef.current = element;
        }
    }, [selectedIndex]);

    return (
        <Paper
            shadow="md"
            p="xs"
            withBorder
            style={{
                minWidth: 500,
                maxHeight: 300,
                overflowY: 'auto',
                fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif'
            }}
            ref={scrollContainerRef}
        >
            <Stack gap={2}>
                {items.map((item: SlashCommand, index: number) => (
                    <Box
                        key={item.title}
                        ref={(el) => setSelectedItemRef(el, index)}
                        onClick={() => {
                            command(item);
                        }}
                        onMouseEnter={() => onItemSelect?.(index)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            backgroundColor: index === selectedIndex ? 'rgba(55, 53, 47, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <Box style={{ color: 'rgba(55, 53, 47, 0.6)' }}>
                            {item.icon}
                        </Box>
                        <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={500} style={{ color: '#37352f' }}>
                                {item.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {item.description}
                            </Text>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
};

const NotesEditor = forwardRef<{ save: () => Promise<any> }, NotesEditorProps>(({
    content,
    onSave,
    onDelete,
    onRename,
    onDownload,
    title,
    updatedAt
}, ref) => {
    const [pageTitle, setPageTitle] = useState(title || 'Sans titre');
    const editorRef = useRef<EditorJS | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializingRef = useRef<boolean>(false);

    // État pour le menu slash
    const [slashMenuOpen, setSlashMenuOpen] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
    const slashMenuTargetRef = useRef<HTMLDivElement>(null);

    // Commandes du menu slash
    const getSuggestionItems = useCallback((query: string): SlashCommand[] => {
        const allCommands: SlashCommand[] = [
            {
                title: 'Titre 1',
                description: 'Grand titre',
                icon: <IconHeading size={18} />,
                searchTerms: ['titre', 'h1', 'heading', 'grand'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('header', { level: 1, text: '' });
                    }
                },
            },
            {
                title: 'Titre 2',
                description: 'Titre moyen',
                icon: <IconHeading size={18} />,
                searchTerms: ['titre', 'h2', 'heading', 'moyen'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('header', { level: 2, text: '' });
                    }
                },
            },
            {
                title: 'Titre 3',
                description: 'Petit titre',
                icon: <IconHeading size={18} />,
                searchTerms: ['titre', 'h3', 'heading', 'petit'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('header', { level: 3, text: '' });
                    }
                },
            },
            {
                title: 'Liste à puces',
                description: 'Créer une liste à puces',
                icon: <IconList size={18} />,
                searchTerms: ['liste', 'puces', 'bullet', 'ul'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('list', { style: 'unordered', items: [''] });
                    }
                },
            },
            {
                title: 'Liste numérotée',
                description: 'Créer une liste numérotée',
                icon: <IconListNumbers size={18} />,
                searchTerms: ['liste', 'numérotée', 'numbered', 'ol', 'ordre'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('list', { style: 'ordered', items: [''] });
                    }
                },
            },
            {
                title: 'Citation',
                description: 'Créer une citation',
                icon: <IconQuote size={18} />,
                searchTerms: ['citation', 'quote', 'blockquote'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('quote', { text: '' });
                    }
                },
            },
            {
                title: 'Code',
                description: 'Créer un bloc de code',
                icon: <IconCode size={18} />,
                searchTerms: ['code', 'programmation', 'snippet'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('code', { code: '' });
                    }
                },
            },
            {
                title: 'Tableau',
                description: 'Créer un tableau',
                icon: <IconTable size={18} />,
                searchTerms: ['tableau', 'table', 'tableau'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('table', {
                            content: [
                                ['', ''],
                                ['', ''],
                            ],
                        });
                    }
                },
            },
            {
                title: 'Image',
                description: 'Insérer une image',
                icon: <IconPhoto size={18} />,
                searchTerms: ['image', 'photo', 'picture', 'img'],
                command: () => {
                    if (editorRef.current) {
                        editorRef.current.blocks.insert('image', {
                            url: '',
                            caption: '',
                            withBorder: false,
                            withBackground: false,
                            stretched: false,
                        });
                    }
                },
            },
        ];

        if (!query) {
            return allCommands;
        }

        const lowerQuery = query.toLowerCase();
        return allCommands.filter((cmd) => {
            return (
                cmd.title.toLowerCase().includes(lowerQuery) ||
                cmd.description.toLowerCase().includes(lowerQuery) ||
                cmd.searchTerms.some((term) => term.toLowerCase().includes(lowerQuery))
            );
        });
    }, []);

    // Initialiser Editor.js
    useEffect(() => {
        // Annuler toute initialisation en cours
        if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
        }

        if (!editorContainerRef.current) return;

        // Éviter les initialisations multiples
        if (isInitializingRef.current) return;
        isInitializingRef.current = true;

        // Détruire l'éditeur existant si présent AVANT de traiter le nouveau contenu
        if (editorRef.current) {
            try {
                if ('destroy' in editorRef.current && typeof (editorRef.current as any).destroy === 'function') {
                    (editorRef.current as any).destroy();
                }
            } catch (error) {
                console.error('Error destroying existing editor:', error);
            }
            editorRef.current = null;
        }

        // Nettoyer le conteneur DOM avant de créer un nouvel éditeur
        if (editorContainerRef.current) {
            // Supprimer tous les enfants pour éviter la duplication
            while (editorContainerRef.current.firstChild) {
                editorContainerRef.current.removeChild(editorContainerRef.current.firstChild);
            }
        }

        // Attendre un peu pour que le DOM soit bien nettoyé
        initTimeoutRef.current = setTimeout(() => {
            // Utiliser le contenu tel quel (format Editor.js)
            let editorJSContent = content;

            // Si le contenu est déjà au format Editor.js avec des blocs, l'utiliser tel quel
            // Sinon créer un document vide
            if (!editorJSContent || !editorJSContent.blocks || !Array.isArray(editorJSContent.blocks) || editorJSContent.blocks.length === 0) {
                // Si pas de contenu, créer un document avec un titre H1
                editorJSContent = {
                    blocks: [
                        {
                            type: 'header',
                            data: {
                                text: title || '',
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
                };
            }
            // Sinon, utiliser le contenu tel quel sans modification

            // Convertir les URLs en liens HTML dans le contenu chargé
            if (editorJSContent && editorJSContent.blocks && Array.isArray(editorJSContent.blocks)) {
                editorJSContent.blocks = editorJSContent.blocks.map((block: any) => {
                    if ((block.type === 'paragraph' || block.type === 'header') &&
                        block.data && block.data.text && typeof block.data.text === 'string') {
                        const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
                        let text = block.data.text;

                        // Si le texte contient des URLs mais pas de balises <a>, les convertir
                        if (!text.includes('<a ') && urlRegex.test(text)) {
                            text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
                            block.data.text = text;
                        }
                    }
                    return block;
                });
            }

            // Vérifier que le conteneur existe toujours et n'a pas déjà d'éditeur
            if (!editorContainerRef.current) {
                isInitializingRef.current = false;
                return;
            }

            // Vérifier qu'il n'y a pas déjà un éditeur Editor.js dans le conteneur
            if (editorContainerRef.current.querySelector('.codex-editor')) {
                // Un éditeur existe déjà, ne pas en créer un nouveau
                isInitializingRef.current = false;
                return;
            }

            let editorInstance: EditorJS | null = null;

            try {
                editorInstance = new EditorJS({
                    holder: editorContainerRef.current,
                    placeholder: 'Commencez à écrire ou tapez "/" pour des commandes...',
                    data: editorJSContent,
                    tools: {
                        paragraph: {
                            class: Paragraph,
                            inlineToolbar: true,
                        },
                        header: {
                            class: Header,
                            config: {
                                placeholder: 'Entrez un titre',
                                levels: [1, 2, 3],
                                defaultLevel: 1,
                            },
                            inlineToolbar: true,
                        },
                        list: {
                            class: List,
                            inlineToolbar: true,
                            config: {
                                defaultStyle: 'unordered',
                            },
                        },
                        checklist: {
                            class: ChecklistTool,
                            inlineToolbar: true,
                        },
                        quote: {
                            class: Quote,
                            inlineToolbar: true,
                            shortcut: 'CMD+SHIFT+O',
                            config: {
                                quotePlaceholder: 'Entrez une citation',
                                captionPlaceholder: 'Auteur de la citation',
                            },
                        },
                        code: {
                            class: Code,
                            config: {
                                placeholder: 'Entrez du code',
                            },
                        },
                        table: {
                            class: Table,
                            inlineToolbar: true,
                            config: {
                                rows: 2,
                                cols: 2,
                            },
                        },
                        image: {
                            class: Image,
                            config: {
                                endpoints: {
                                    byFile: '/api/upload/image',
                                    byUrl: '/api/fetch/image',
                                },
                                buttonContent: 'Sélectionner une image',
                                captionPlaceholder: 'Légende de l\'image',
                                uploader: {
                                    async uploadByFile(file: File) {
                                        // Pour l'instant, retourner une URL de données
                                        // Dans une vraie app, vous feriez un upload vers votre serveur
                                        return new Promise((resolve) => {
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                                resolve({
                                                    success: 1,
                                                    file: {
                                                        url: e.target?.result as string,
                                                    },
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                        });
                                    },
                                    async uploadByUrl(url: string) {
                                        return {
                                            success: 1,
                                            file: {
                                                url: url,
                                            },
                                        };
                                    },
                                },
                            },
                        },
                    } as any,
                    onChange: async () => {
                        if (editorInstance && onSave) {
                            if (saveTimeoutRef.current) {
                                clearTimeout(saveTimeoutRef.current);
                            }
                            saveTimeoutRef.current = setTimeout(async () => {
                                try {
                                    const outputData = await editorInstance!.save();

                                    // Convertir automatiquement les URLs en liens HTML dans les paragraphes et headers
                                    if (outputData && outputData.blocks) {
                                        outputData.blocks = outputData.blocks.map((block: any) => {
                                            // Traiter les paragraphes et les headers
                                            if ((block.type === 'paragraph' || block.type === 'header') &&
                                                block.data && block.data.text && typeof block.data.text === 'string') {
                                                const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
                                                let text = block.data.text;

                                                // Vérifier si le texte contient déjà des balises HTML
                                                if (!text.includes('<a ') && urlRegex.test(text)) {
                                                    // Convertir les URLs en balises <a>
                                                    text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
                                                    block.data.text = text;
                                                }
                                            }
                                            return block;
                                        });
                                    }

                                    onSave(outputData);
                                } catch (error) {
                                    console.error('Saving failed:', error);
                                }
                            }, 1000);
                        }
                    },
                });

                // Stocker la référence après l'initialisation
                editorRef.current = editorInstance;
                isInitializingRef.current = false;
            } catch (error) {
                console.error('Error initializing Editor.js:', error);
                isInitializingRef.current = false;
            }
        }, 50); // Petit délai pour s'assurer que le DOM est nettoyé

        return () => {
            // Annuler l'initialisation en cours si elle existe
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
                initTimeoutRef.current = null;
            }

            isInitializingRef.current = false;

            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Nettoyer l'instance de l'éditeur
            const editorToDestroy = editorRef.current;
            if (editorToDestroy) {
                // Vérifier si la méthode destroy existe avant de l'appeler
                if ('destroy' in editorToDestroy && typeof (editorToDestroy as any).destroy === 'function') {
                    try {
                        (editorToDestroy as any).destroy();
                    } catch (error) {
                        console.error('Error destroying editor:', error);
                    }
                }
            }

            editorRef.current = null;

            // Nettoyer aussi le conteneur DOM complètement
            if (editorContainerRef.current) {
                while (editorContainerRef.current.firstChild) {
                    editorContainerRef.current.removeChild(editorContainerRef.current.firstChild);
                }
            }
        };
    }, [content]); // Seulement réinitialiser quand le contenu change (pas title ni onSave pour éviter les réinitialisations inutiles)

    // Détecter les URLs et les convertir en liens visuellement (uniquement après qu'elles soient terminées)
    useEffect(() => {
        if (!editorRef.current || !editorContainerRef.current) return;

        const editorElement = editorContainerRef.current.querySelector('.codex-editor');
        if (!editorElement) return;

        let convertTimeout: NodeJS.Timeout | null = null;

        const convertUrlsInDOM = () => {
            // Obtenir la position actuelle du curseur
            const selection = window.getSelection();
            const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
            let activeBlock: Element | null = null;
            let cursorOffset = 0;

            if (range) {
                const activeElement = range.startContainer;
                activeBlock = activeElement.nodeType === Node.TEXT_NODE
                    ? activeElement.parentElement?.closest('.ce-block') as Element || null
                    : (activeElement as Element).closest('.ce-block');

                if (activeBlock && activeElement.nodeType === Node.TEXT_NODE) {
                    const contentEditable = activeBlock.querySelector('[contenteditable="true"]');
                    if (contentEditable) {
                        cursorOffset = range.startOffset;
                    }
                }
            }

            // Parcourir tous les blocs et convertir les URLs en liens HTML
            const blocks = editorElement.querySelectorAll('.ce-block');
            blocks.forEach((block) => {
                const contentEditable = block.querySelector('[contenteditable="true"]');
                if (!contentEditable) return;

                // Ne pas modifier le bloc actif si l'utilisateur est en train d'écrire
                if (block === activeBlock) {
                    // Vérifier si le curseur est dans une URL en cours d'écriture
                    const textBeforeCursor = (contentEditable.textContent || '').substring(0, cursorOffset);
                    const urlInProgress = /https?:\/\/[^\s<>"']*$/i.test(textBeforeCursor);

                    // Si on est en train d'écrire une URL, ne pas convertir
                    if (urlInProgress && textBeforeCursor.includes('://')) {
                        return;
                    }
                }

                const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
                const fullText = contentEditable.textContent || '';

                // Ne convertir que les URLs complètes (suivies d'un espace, retour à la ligne, ou fin de texte)
                const completeUrlRegex = /(https?:\/\/[^\s<>"']+)(?=\s|$)/gi;

                // Vérifier s'il y a des URLs complètes et s'il n'y a pas déjà de liens
                if (completeUrlRegex.test(fullText) && !contentEditable.querySelector('a')) {
                    // Sauvegarder la position du curseur si c'est ce bloc
                    let savedRange: Range | null = null;
                    if (block === activeBlock && range) {
                        savedRange = range.cloneRange();
                    }

                    // Créer un nouveau contenu avec les liens (seulement les URLs complètes)
                    const parts = fullText.split(completeUrlRegex);
                    let newHTML = '';

                    parts.forEach((part) => {
                        if (completeUrlRegex.test(part)) {
                            newHTML += `<a href="${part}" target="_blank" rel="noopener noreferrer">${part}</a>`;
                        } else {
                            // Échapper le HTML pour éviter les injections
                            newHTML += part.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                    });

                    contentEditable.innerHTML = newHTML;

                    // Restaurer la position du curseur si nécessaire
                    if (savedRange && block === activeBlock) {
                        try {
                            selection?.removeAllRanges();
                            // Trouver la position approximative du curseur
                            const textNodes = Array.from(contentEditable.childNodes);
                            let offset = 0;
                            for (const node of textNodes) {
                                if (node.nodeType === Node.TEXT_NODE) {
                                    const nodeLength = node.textContent?.length || 0;
                                    if (cursorOffset <= offset + nodeLength) {
                                        const newRange = document.createRange();
                                        newRange.setStart(node, cursorOffset - offset);
                                        newRange.collapse(true);
                                        selection?.addRange(newRange);
                                        break;
                                    }
                                    offset += nodeLength;
                                } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'A') {
                                    const nodeLength = node.textContent?.length || 0;
                                    if (cursorOffset <= offset + nodeLength) {
                                        // Le curseur est dans un lien, placer après
                                        const newRange = document.createRange();
                                        newRange.setStartAfter(node);
                                        newRange.collapse(true);
                                        selection?.addRange(newRange);
                                        break;
                                    }
                                    offset += nodeLength;
                                }
                            }
                        } catch (e) {
                            // Ignorer les erreurs de restauration du curseur
                        }
                    }
                }
            });
        };

        // Observer les changements dans l'éditeur avec un délai important
        const observer = new MutationObserver(() => {
            // Annuler la conversion précédente si l'utilisateur tape encore
            if (convertTimeout) {
                clearTimeout(convertTimeout);
            }

            // Attendre 1.5 secondes après la dernière frappe avant de convertir
            convertTimeout = setTimeout(() => {
                convertUrlsInDOM();
            }, 1500);
        });

        observer.observe(editorElement, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        // Convertir immédiatement au chargement (mais pas pendant l'écriture)
        setTimeout(convertUrlsInDOM, 1000);

        return () => {
            if (convertTimeout) {
                clearTimeout(convertTimeout);
            }
            observer.disconnect();
        };
    }, [editorRef.current]);

    // Gérer le menu slash
    useEffect(() => {
        if (!editorRef.current || !editorContainerRef.current) return;

        const editorElement = editorContainerRef.current.querySelector('.codex-editor');
        if (!editorElement) return;

        const handleKeyDown = (e: Event) => {
            const keyboardEvent = e as KeyboardEvent;
            // Détecter "/" dans un bloc de texte
            if (keyboardEvent.key === '/' && !slashMenuOpen && !keyboardEvent.ctrlKey && !keyboardEvent.metaKey) {
                const activeBlock = editorElement.querySelector('.ce-block--focused');
                if (activeBlock) {
                    const rect = activeBlock.getBoundingClientRect();
                    const containerRect = editorContainerRef.current!.getBoundingClientRect();

                    setSlashMenuPosition({
                        top: rect.top - containerRect.top + 20,
                        left: rect.left - containerRect.left,
                    });

                    if (slashMenuTargetRef.current) {
                        slashMenuTargetRef.current.style.top = `${rect.top - containerRect.top + 20}px`;
                        slashMenuTargetRef.current.style.left = `${rect.left - containerRect.left}px`;
                    }

                    setSlashQuery('');
                    setSlashSelectedIndex(0);
                    setSlashMenuOpen(true);
                }
            }

            // Gérer la saisie pour filtrer le menu
            if (slashMenuOpen) {
                if (keyboardEvent.key === 'ArrowDown') {
                    keyboardEvent.preventDefault();
                    setSlashSelectedIndex((prev) => Math.min(prev + 1, getSuggestionItems(slashQuery).length - 1));
                    return false;
                }

                if (keyboardEvent.key === 'ArrowUp') {
                    keyboardEvent.preventDefault();
                    setSlashSelectedIndex((prev) => Math.max(prev - 1, 0));
                    return false;
                }

                if (keyboardEvent.key === 'Enter') {
                    keyboardEvent.preventDefault();
                    const items = getSuggestionItems(slashQuery);
                    const item = items[slashSelectedIndex];
                    if (item) {
                        // Supprimer le "/" du bloc actuel
                        const activeBlock = editorElement.querySelector('.ce-block--focused');
                        if (activeBlock) {
                            const blockContent = activeBlock.querySelector('[contenteditable]') as HTMLElement;
                            if (blockContent) {
                                const text = blockContent.textContent || '';
                                const slashIndex = text.lastIndexOf('/');
                                if (slashIndex !== -1) {
                                    const newText = text.substring(0, slashIndex) + text.substring(slashIndex + 1);
                                    blockContent.textContent = newText;
                                    // Mettre à jour le curseur
                                    const range = document.createRange();
                                    range.selectNodeContents(blockContent);
                                    range.collapse(false);
                                    const selection = window.getSelection();
                                    selection?.removeAllRanges();
                                    selection?.addRange(range);
                                }
                            }
                        }
                        item.command();
                        setSlashMenuOpen(false);
                        setSlashQuery('');
                    }
                    return false;
                }

                if (keyboardEvent.key === 'Escape') {
                    keyboardEvent.preventDefault();
                    // Supprimer le "/" du bloc actuel
                    const activeBlock = editorElement.querySelector('.ce-block--focused');
                    if (activeBlock) {
                        const blockContent = activeBlock.querySelector('[contenteditable]') as HTMLElement;
                        if (blockContent) {
                            const text = blockContent.textContent || '';
                            const slashIndex = text.lastIndexOf('/');
                            if (slashIndex !== -1) {
                                const newText = text.substring(0, slashIndex) + text.substring(slashIndex + 1);
                                blockContent.textContent = newText;
                                const range = document.createRange();
                                range.selectNodeContents(blockContent);
                                range.collapse(false);
                                const selection = window.getSelection();
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                            }
                        }
                    }
                    setSlashMenuOpen(false);
                    setSlashQuery('');
                    return false;
                }

                if (keyboardEvent.key.length === 1 && !keyboardEvent.ctrlKey && !keyboardEvent.metaKey && keyboardEvent.key !== '/') {
                    setSlashQuery((prev) => prev + keyboardEvent.key);
                    return false;
                } else if (keyboardEvent.key === 'Backspace') {
                    if (slashQuery.length > 0) {
                        setSlashQuery((prev) => prev.slice(0, -1));
                        return false;
                    }
                }
            }
        };

        editorElement.addEventListener('keydown', handleKeyDown);

        return () => {
            editorElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [editorRef.current, slashMenuOpen, slashQuery, getSuggestionItems]);

    // Gérer le clic sur les handles de bloc (3 points)
    useEffect(() => {
        if (!editorRef.current || !editorContainerRef.current) return;

        const editorElement = editorContainerRef.current.querySelector('.codex-editor');
        if (!editorElement) return;

        const handleClick = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            const target = mouseEvent.target as HTMLElement;
            const blockSettings = target.closest('.ce-block__settings');

            if (blockSettings) {
                // Ouvrir le menu slash
                const block = blockSettings.closest('.ce-block');
                if (block) {
                    const rect = block.getBoundingClientRect();
                    const containerRect = editorContainerRef.current!.getBoundingClientRect();

                    setSlashMenuPosition({
                        top: rect.top - containerRect.top + rect.height / 2,
                        left: rect.left - containerRect.left,
                    });

                    if (slashMenuTargetRef.current) {
                        slashMenuTargetRef.current.style.top = `${rect.top - containerRect.top + rect.height / 2}px`;
                        slashMenuTargetRef.current.style.left = `${rect.left - containerRect.left}px`;
                    }

                    setSlashQuery('');
                    setSlashSelectedIndex(0);
                    setSlashMenuOpen(true);
                }
            }
        };

        editorElement.addEventListener('click', handleClick);

        return () => {
            editorElement.removeEventListener('click', handleClick);
        };
    }, [editorRef.current]);

    // Extraire le titre du premier bloc header
    useEffect(() => {
        if (editorRef.current && onRename) {
            const updateTitle = async () => {
                try {
                    const data = await editorRef.current!.save();
                    const firstBlock = data.blocks?.[0];
                    if (firstBlock && firstBlock.type === 'header' && firstBlock.data?.level === 1) {
                        const titleText = firstBlock.data.text || '';
                        if (titleText !== pageTitle) {
                            setPageTitle(titleText || 'Sans titre');
                            if (titleText) {
                                onRename(titleText);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error getting title:', error);
                }
            };

            const timeoutId = setTimeout(updateTitle, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [editorRef.current, onRename, pageTitle]);

    // Exposer la méthode save via ref
    useImperativeHandle(ref, () => ({
        save: async () => {
            if (editorRef.current) {
                return await editorRef.current.save();
            }
            return null;
        }
    }));

    return (
        <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            {/* Barre d'actions minimaliste en haut */}
            <Box
                p="sm"
                style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexShrink: 0
                }}
            >
                <Group gap="xs">
                    <Text size="xs" c="dimmed" mr="md">
                        {updatedAt ? formatTimeAgo(updatedAt) : 'Jamais modifié'}
                    </Text>
                    <Menu>
                        <Menu.Target>
                            <ActionIcon variant="subtle" size="sm">
                                <IconDots size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconDownload size={16} />}
                                onClick={onDownload}
                            >
                                Télécharger en PDF
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconShare size={16} />}
                                disabled
                                c="dimmed"
                            >
                                Partager
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<IconTrash size={16} />}
                                c="red"
                                onClick={onDelete}
                            >
                                Supprimer
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Box>

            {/* Editor avec style Notion */}
            <Box
                ref={editorContainerRef}
                style={{
                    flex: 1,
                    padding: '48px 0px 48px 0px',
                    width: '100%',
                    position: 'relative',
                    overflowY: 'auto',
                    overflowX: 'visible'
                }}
            >
                {/* Popover pour le menu slash */}
                <Popover
                    opened={slashMenuOpen && getSuggestionItems(slashQuery).length > 0}
                    position="bottom-start"
                    offset={5}
                    withArrow
                    withinPortal
                    trapFocus={false}
                    closeOnClickOutside={true}
                    onClose={() => setSlashMenuOpen(false)}
                    styles={{
                        dropdown: {
                            padding: 0,
                            fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif',
                        }
                    }}
                >
                    <Popover.Target>
                        <div
                            ref={slashMenuTargetRef}
                            style={{
                                position: 'absolute',
                                top: `${slashMenuPosition.top}px`,
                                left: `${slashMenuPosition.left}px`,
                                pointerEvents: 'none',
                                width: '1px',
                                height: '1px',
                            }}
                        />
                    </Popover.Target>
                    <Popover.Dropdown>
                        <SlashMenuList
                            items={getSuggestionItems(slashQuery)}
                            command={(item: SlashCommand) => {
                                // Supprimer le "/" du bloc actuel
                                if (editorContainerRef.current) {
                                    const editorElement = editorContainerRef.current.querySelector('.codex-editor');
                                    if (editorElement) {
                                        const activeBlock = editorElement.querySelector('.ce-block--focused');
                                        if (activeBlock) {
                                            const blockContent = activeBlock.querySelector('[contenteditable]') as HTMLElement;
                                            if (blockContent) {
                                                const text = blockContent.textContent || '';
                                                const slashIndex = text.lastIndexOf('/');
                                                if (slashIndex !== -1) {
                                                    const newText = text.substring(0, slashIndex) + text.substring(slashIndex + 1);
                                                    blockContent.textContent = newText;
                                                }
                                            }
                                        }
                                    }
                                }
                                item.command();
                                setSlashMenuOpen(false);
                                setSlashQuery('');
                            }}
                            selectedIndex={slashSelectedIndex}
                            onItemSelect={setSlashSelectedIndex}
                        />
                    </Popover.Dropdown>
                </Popover>

            </Box>
        </Box>
    );
});

NotesEditor.displayName = 'NotesEditor';

export default NotesEditor;