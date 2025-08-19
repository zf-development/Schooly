// TODO: Fournit l'école active
// - Créer le contexte institution
// - Gérer l'institution courante de l'utilisateur
// - Permettre le changement d'institution

import React, { createContext, useContext, useState } from 'react';

// TODO: Interface pour l'institution
interface Institution {
    id: string;
    name: string;
    type: 'school' | 'university' | 'college';
    logo?: string;
}

// TODO: Interface pour le contexte
interface InstitutionContextType {
    institution: Institution | null;
    setInstitution: (institution: Institution | null) => void;
    isLoading: boolean;
}

// TODO: Créer le contexte
const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

// TODO: Provider du contexte
export const InstitutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // TODO: Implémenter la logique du provider
    return (
        <InstitutionContext.Provider value={{ institution, setInstitution, isLoading }}>
            {children}
        </InstitutionContext.Provider>
    );
};

// TODO: Hook pour utiliser le contexte
export const useInstitutionContext = () => {
    const context = useContext(InstitutionContext);
    if (context === undefined) {
        throw new Error('useInstitutionContext must be used within an InstitutionProvider');
    }
    return context;
};
