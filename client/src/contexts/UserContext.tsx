// TODO: Fournit l'utilisateur à l'app
// - Créer le contexte utilisateur
// - Fournir les méthodes de gestion de l'utilisateur
// - Gérer l'état global de l'utilisateur

import React, { createContext, useContext, useState } from 'react';

// TODO: Interface pour l'utilisateur
interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

// TODO: Interface pour le contexte
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
}

// TODO: Créer le contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// TODO: Provider du contexte
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // TODO: Implémenter la logique du provider
    return (
        <UserContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

// TODO: Hook pour utiliser le contexte
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};
