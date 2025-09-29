import React, { createContext, useContext, useState } from 'react';

interface Institution {
    id: string;
    name: string;
    type: 'school' | 'university' | 'college';
    logo?: string;
}

interface InstitutionContextType {
    institution: Institution | null;
    setInstitution: (institution: Institution | null) => void;
    isLoading: boolean;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const InstitutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <InstitutionContext.Provider value={{ institution, setInstitution, isLoading }}>
            {children}
        </InstitutionContext.Provider>
    );
};

export const useInstitutionContext = () => {
    const context = useContext(InstitutionContext);
    if (context === undefined) {
        throw new Error('useInstitutionContext must be used within an InstitutionProvider');
    }
    return context;
};
