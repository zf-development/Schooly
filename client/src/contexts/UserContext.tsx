// Fournit l'utilisateur à l'app
// - Créer le contexte utilisateur
// - Fournir les méthodes de gestion de l'utilisateur
// - Gérer l'état global de l'utilisateur

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Interface pour l'utilisateur
interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string; // Utiliser le même nom que l'API
}

// Interface pour le contexte
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    logout: () => Promise<void>;
}

// Créer le contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider du contexte
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fonction de déconnexion
    const logout = async () => {
        try {
            setIsLoading(true);

            // Appeler notre API de déconnexion
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Nettoyer le token local
                localStorage.removeItem('authToken');
                setUser(null);

                // Rediriger vers la page de connexion
                window.location.href = '/login';
            } else {
                console.error('Erreur lors de la déconnexion');
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initialisation avec vérification du token
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');

                if (!token) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                // Vérifier si le token est valide en appelant notre API
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser({
                        id: userData.user.id,
                        email: userData.user.email,
                        name: userData.user.name || 'Utilisateur',
                        avatar_url: userData.user.avatar_url
                    });
                } else {
                    // Token invalide, le supprimer
                    localStorage.removeItem('authToken');
                    setUser(null);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'authentification:', error);
                // En cas d'erreur, supprimer le token et considérer comme non connecté
                localStorage.removeItem('authToken');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook pour utiliser le contexte
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};
