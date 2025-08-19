import React, { useState, useEffect } from 'react';
import { Stack, Title, Paper, Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import MainLayout from '../layouts/MainLayout';
import PostForm from '../components/PostForm';
import FeedList from '../components/FeedList';
import type { Post, InstitutionOption, AuthButtonProps } from '../types';
import apiService from '../services/api';

// Données de démonstration pour les institutions
const demoInstitutions: InstitutionOption[] = [
  { id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c', name: 'MGR Parent' },
  { id: 'demo-institution-2', name: 'Cégep Édouard-Montpetit' }
];

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(demoInstitutions[0].id);

  // Charger les posts au montage du composant
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoadingPosts(true);
    setError(null);

    try {
      const response = await apiService.getPosts();

      if (response.success && response.data) {
        // Transformer les données du backend au format frontend
        const postsData = response.data as any;

        // Les posts sont dans postsData.posts, pas directement dans postsData
        const postsArray = postsData.posts || [];

        const transformedPosts: Post[] = postsArray.map((post: any) => ({
          id: post.id,
          author: {
            id: post.author_id,
            name: 'Utilisateur', // TODO: Récupérer le nom depuis l'API users
            institution: 'MGR Parent' // TODO: Récupérer le nom depuis l'API institutions
          },
          content: post.content,
          visibility: post.visibility,
          createdAt: new Date(post.created_at)
        }));

        setPosts(transformedPosts);
      } else {
        setError(response.error || 'Erreur lors du chargement des posts');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async (title: string, content: string, visibility: 'public' | 'private') => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiService.createPost({ title, content, visibility });

      if (response.success && response.data) {
        setSuccess(true);
        // Transformer le nouveau post
        const newPost: Post = {
          id: response.data.id,
          author: {
            id: response.data.author_id,
            name: response.data.author?.name || 'Vous',
            institution: response.data.institution?.name || 'MGR Parent'
          },
          content: response.data.content,
          visibility: response.data.visibility,
          createdAt: new Date(response.data.created_at)
        };

        // Ajouter le nouveau post au début de la liste
        setPosts(prev => [newPost, ...prev]);

        // Recharger les posts pour avoir les données complètes
        await loadPosts();
      } else {
        setError(response.error || 'Erreur lors de la création du post');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionChange = (institutionId: string) => {
    setSelectedInstitutionId(institutionId);
    // TODO: Filtrer les posts par institution
  };

  const authProps: AuthButtonProps = {
    isAuthenticated: true,
    onLogin: () => { },
    onLogout: () => { }
  };

  return (
    <MainLayout
      institutions={demoInstitutions}
      selectedInstitutionId={selectedInstitutionId}
      onInstitutionChange={handleInstitutionChange}
      authProps={authProps}
    >
      <Stack gap="xl">
        <Title order={1} ta="center" c="academic">
          Fil d'actualité
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red" variant="light">
            <Text size="sm">{error}</Text>
          </Alert>
        )}

        <Paper p="lg" withBorder>
          <PostForm onSubmit={handleCreatePost} loading={loading} success={success} />
        </Paper>

        <FeedList posts={posts} loading={loadingPosts} />
      </Stack>
    </MainLayout>
  );
};

export default FeedPage;
