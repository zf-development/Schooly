import React, { useState, useEffect, useRef } from "react";
import { Button, Paper, Skeleton } from "@mantine/core";
import type { PostFormProps } from "../types";
import PostFormAreaEditor, {
    PostFormAreaEditorRef,
} from "./PostFormAreaEditor";

const PostForm: React.FC<PostFormProps> = ({
    onSubmit,
    loading,
    success = false,
}) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">(
        "public"
    );
    const [files, setFiles] = useState<File[]>([]);
    const editorRef = useRef<PostFormAreaEditorRef>(null);

    useEffect(() => {
        if (success && !loading) {
            setTitle("");
            setContent("");
            setVisibility("public");
            setFiles([]);

            // Vider l'éditeur via la ref
            if (editorRef.current) {
                editorRef.current.clearEditor();
            }
        }
    }, [success, loading]);

    const handleContentChange = (newTitle: string, newContent: string) => {
        setTitle(newTitle);
        setContent(newContent);
    };

    const handleVisibilityChange = (newVisibility: string) => {
        setVisibility(newVisibility as "public" | "private");
    };

    const handleFilesChange = (newFiles: File[]) => {
        setFiles(newFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(title, content, visibility);
    };

    return (
        <Paper>
            <PostFormAreaEditor
                ref={editorRef}
                onContentChange={handleContentChange}
                onVisibilityChange={handleVisibilityChange}
                onFilesChange={handleFilesChange}
                initialTitle={title}
                initialContent={content}
                initialVisibility={visibility}
            />

            {loading ? (
                <Skeleton height={42} width="100%" />
            ) : (
                <Button
                    variant="filled"
                    color="academic"
                    onClick={handleSubmit}
                    disabled={!title.trim() || !content.trim()}
                    fullWidth
                    size="md"
                    style={{
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                    }}
                >
                    Publier le Post
                </Button>
            )}
        </Paper>
    );
};

export default PostForm;
