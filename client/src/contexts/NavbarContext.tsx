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

    const getInitialNavbarState = (): boolean => {
        try {
            const saved = localStorage.getItem("navbarOpen");
            return saved !== null ? JSON.parse(saved) : true;
        } catch (error) {
            console.warn("Erreur lors de la lecture du localStorage:", error);
            return true;
        }
    };

    const [isOpen, setIsOpen] = useState(getInitialNavbarState);
    const [hasInitialized, setHasInitialized] = useState(false);

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
