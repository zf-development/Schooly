import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
    Card, 
    ActionIcon, 
    Tooltip, 
    Select,
    Box,
    CloseButton
} from '@mantine/core';
import { 
    IconPaperclip, 
    IconGlobe,
    IconLock,
    IconFile,
    IconPhoto,
    IconFileText
} from '@tabler/icons-react';
import classes from './PostFormAreaEditor.module.css';

interface PostFormAreaEditorProps {
    onContentChange: (title: string, content: string) => void;
    onVisibilityChange: (visibility: string) => void;
    onFilesChange: (files: File[]) => void;
    onClear?: () => void;
    initialTitle?: string;
    initialContent?: string;
    initialVisibility?: string;
}

export interface PostFormAreaEditorRef {
    clearEditor: () => void;
}

const PostFormAreaEditor = forwardRef<PostFormAreaEditorRef, PostFormAreaEditorProps>(({
    onContentChange,
    onVisibilityChange,
    onFilesChange,
    onClear,
    initialTitle = '',
    initialContent = '',
    initialVisibility = 'public'
}, ref) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [visibility, setVisibility] = useState(initialVisibility);
    const [isFocused, setIsFocused] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onContentChange(title, content);
    }, [title, content, onContentChange]);

    useEffect(() => {
        onVisibilityChange(visibility);
    }, [visibility, onVisibilityChange]);

    useImperativeHandle(ref, () => ({
        clearEditor
    }));

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const editor = e.currentTarget;
        const text = editor.textContent || '';
        
        const lines = text.split('\n');
        const newTitle = lines.find(line => line.trim()) || '';
        const contentLines = lines.slice(1).filter(line => line.trim());
        const newContent = contentLines.join('\n');
        
        setTitle(newTitle);
        setContent(newContent);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                
                const textNode = document.createTextNode('\n');
                range.deleteContents();
                range.insertNode(textNode);
                
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.setEndAfter(textNode);
                
                requestAnimationFrame(() => {
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                });
            }
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);
        if (newFiles.length > 0) {
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);
            onFilesChange(updatedFiles);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange(newFiles);
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <IconPhoto size={14} />;
        } else if (file.type.includes('pdf') || file.type.includes('document')) {
            return <IconFileText size={14} />;
        } else {
            return <IconFile size={14} />;
        }
    };

    const clearEditor = () => {
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
            setTitle('');
            setContent('');
            setVisibility('public');
            setFiles([]);
        }
        if (onClear) {
            onClear();
        }
    };

    const getVisibilityIcon = () => {
        switch (visibility) {
            case 'public':
                return <IconGlobe size={16} />;
            case 'private':
                return <IconLock size={16} />;
            default:
                return <IconGlobe size={16} />;
        }
    };

    const getVisibilityLabel = () => {
        switch (visibility) {
            case 'public':
                return 'Public';
            case 'institution':
                return 'Institution';
            case 'private':
                return 'Privé';
            default:
                return 'Public';
        }
    };

    return (
        <Card className={classes.editorContainer} shadow="sm" radius="md" p="md">
            <Box className={classes.editorSection}>
                {/* Contrôles flottants */}
                <div className={classes.floatingControls}>
                    <Tooltip label="Ajouter des fichiers" position="top">
                        <ActionIcon
                            variant="subtle"
                            color="violet"
                            size="md"
                            onClick={triggerFileUpload}
                            className={classes.actionButton}
                        >
                            <IconPaperclip size={18} />
                        </ActionIcon>
                    </Tooltip>

                    <Select
                        value={visibility}
                        onChange={(value) => setVisibility(value || 'public')}
                        data={[
                            { value: 'public', label: 'Public' },
                            { value: 'private', label: 'Privé' }
                        ]}
                        leftSection={getVisibilityIcon()}
                        size="xs"
                        w={120}
                        styles={{
                            input: {
                                fontSize: '12px',
                                fontWeight: 500
                            }
                        }}
                    />
                </div>

                {/* Zone d'édition */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className={`${classes.unifiedEditor} ${isFocused ? classes.focused : ''}`}
                    onInput={handleContentChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    data-placeholder="Titre du post
Contenu de votre post"
                />

                {/* Prévisualisation des fichiers */}
                {files.length > 0 && (
                    <div className={classes.fileBadges}>
                        {files.map((file, index) => (
                            <div key={index} className={classes.fileBadge}>
                                {getFileIcon(file)}
                                <span>{file.name}</span>
                                <CloseButton
                                    size="xs"
                                    onClick={() => removeFile(index)}
                                    className={classes.removeFileButton}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                />
            </Box>
        </Card>
    );
});

PostFormAreaEditor.displayName = 'PostFormAreaEditor';

export default PostFormAreaEditor;
