import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
} from "react";

interface NavbarContextType {
    isOpen: boolean;
    toggleNavbar: () => void;
    setNavbarOpen: (open: boolean) => void;
    hasInitialized: boolean;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbarContext = () => {
    const context = useContext(NavbarContext);
    if (context === undefined) {
        throw new Error(
            "useNavbarContext must be used within a NavbarProvider"
        );
    }
    return context;
};

interface NavbarProviderProps {
    children: React.ReactNode;
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
    const initializedRef = useRef(false);

    // Récupérer l'état initial depuis localStorage
    const getInitialNavbarState = (): boolean => {
        try {
            const saved = localStorage.getItem("navbarOpen");
            return saved !== null ? JSON.parse(saved) : true; // Par défaut ouvert
        } catch (error) {
            console.warn("Erreur lors de la lecture du localStorage:", error);
            return true; // Fallback par défaut
        }
    };

    const [isOpen, setIsOpen] = useState(getInitialNavbarState);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Sauvegarder l'état dans localStorage à chaque changement
    useEffect(() => {
        try {
            localStorage.setItem("navbarOpen", JSON.stringify(isOpen));
        } catch (error) {
            console.warn(
                "Erreur lors de la sauvegarde dans localStorage:",
                error
            );
        }
    }, [isOpen]);

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            setHasInitialized(true);
        }
    }, []);

    const toggleNavbar = () => setIsOpen(!isOpen);
    const setNavbarOpen = (open: boolean) => setIsOpen(open);

    return (
        <NavbarContext.Provider
            value={{ isOpen, toggleNavbar, setNavbarOpen, hasInitialized }}
        >
            {children}
        </NavbarContext.Provider>
    );
};
