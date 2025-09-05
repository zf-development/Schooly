// Fournit l'utilisateur à l'app
// - Créer le contexte utilisateur
// - Fournir les méthodes de gestion de l'utilisateur
// - Gérer l'état global de l'utilisateur
// - Gérer automatiquement l'expiration des tokens

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { setTokenExpiredCallback } from "../services/api";

// Interface pour l'utilisateur
interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string; // Utiliser le même nom que l'API
    institution?: {
        id: string;
        name: string;
    };
    subscriptions?: Array<{
        id: string;
        institution_id: string;
        created_at: string;
    }>;
}

// Interface pour le contexte
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    logout: () => Promise<void>;
    forceLogout: () => void; // Déconnexion forcée sans appel API
    isTokenExpired: boolean;
}

// Créer le contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider du contexte
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenExpired, setIsTokenExpired] = useState(false);

    // Fonction de déconnexion forcée (sans appel API)
    const forceLogout = useCallback(() => {
        localStorage.removeItem("authToken");
        setUser(null);
        setIsTokenExpired(false);
        // Rediriger vers la page de connexion
        window.location.href = "/login";
    }, []);

    // Enregistrer le callback de déconnexion dans le service API
    useEffect(() => {
        setTokenExpiredCallback(forceLogout);
    }, [forceLogout]);

    // Fonction de déconnexion normale
    const logout = async () => {
        try {
            setIsLoading(true);

            // Appeler notre API de déconnexion
            const response = await fetch(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:3001/api"
                }/auth/logout`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "authToken"
                        )}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Même si l'API échoue, on se déconnecte localement
            forceLogout();
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            // En cas d'erreur, on se déconnecte quand même
            forceLogout();
        } finally {
            setIsLoading(false);
        }
    };

    // Vérifier si un token est expiré en analysant sa structure
    const isTokenExpiredCheck = useCallback((token: string): boolean => {
        try {
            // Décoder le JWT pour vérifier l'expiration
            const payload = JSON.parse(atob(token.split(".")[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            // Vérifier si le token est expiré (avec une marge de 5 minutes)
            if (payload.exp && payload.exp < currentTime + 300) {
                return true;
            }

            return false;
        } catch (error) {
            console.error("Erreur lors de la vérification du token:", error);
            return true; // En cas d'erreur, considérer comme expiré
        }
    }, []);

    // Initialisation avec vérification du token
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("authToken");

                if (!token) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                // Vérifier d'abord si le token est expiré localement
                if (isTokenExpiredCheck(token)) {
                    console.log("Token expiré détecté localement");
                    setIsTokenExpired(true);
                    forceLogout();
                    return;
                }

                // Vérifier si le token est valide en appelant notre API
                const response = await fetch(
                    `${
                        import.meta.env.VITE_API_URL ||
                        "http://localhost:3001/api"
                    }/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const userData = await response.json();
                    setUser({
                        id: userData.user.id,
                        email: userData.user.email,
                        name: userData.user.display_name || userData.user.name || "Utilisateur",
                        avatar_url: userData.user.avatar_url,
                        institution: userData.user.institution,
                    });
                    setIsTokenExpired(false);
                } else if (response.status === 401) {
                    // Token invalide ou expiré
                    console.log("Token invalide détecté par l'API");
                    setIsTokenExpired(true);
                    forceLogout();
                } else {
                    // Autre erreur
                    console.error(
                        "Erreur lors de la vérification:",
                        response.status
                    );
                    setIsTokenExpired(true);
                    forceLogout();
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la vérification de l'authentification:",
                    error
                );
                // En cas d'erreur, supprimer le token et considérer comme non connecté
                setIsTokenExpired(true);
                forceLogout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [forceLogout, isTokenExpiredCheck]);

    // Vérifier périodiquement la validité du token (toutes les 5 minutes)
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            const token = localStorage.getItem("authToken");
            if (token && isTokenExpiredCheck(token)) {
                console.log(
                    "Token expiré détecté lors de la vérification périodique"
                );
                setIsTokenExpired(true);
                forceLogout();
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [user, forceLogout, isTokenExpiredCheck]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                logout,
                forceLogout,
                isTokenExpired,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Hook pour utiliser le contexte
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};
