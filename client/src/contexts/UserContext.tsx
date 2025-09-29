import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { setTokenExpiredCallback } from "../services/api";

interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
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

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    logout: () => Promise<void>;
    forceLogout: () => void;
    isTokenExpired: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenExpired, setIsTokenExpired] = useState(false);

    const forceLogout = useCallback(() => {
        localStorage.removeItem("authToken");
        setUser(null);
        setIsTokenExpired(false);
        window.location.href = "/login";
    }, []);

    useEffect(() => {
        setTokenExpiredCallback(forceLogout);
    }, [forceLogout]);

    const logout = async () => {
        try {
            setIsLoading(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"
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

            forceLogout();
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            forceLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const isTokenExpiredCheck = useCallback((token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < currentTime + 300) {
                return true;
            }

            return false;
        } catch (error) {
            console.error("Erreur lors de la vérification du token:", error);
            return true;
        }
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("authToken");

                if (!token) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                if (isTokenExpiredCheck(token)) {
                    console.log("Token expiré détecté localement");
                    setIsTokenExpired(true);
                    forceLogout();
                    return;
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL ||
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
                    console.log("Token invalide détecté par l'API");
                    setIsTokenExpired(true);
                    forceLogout();
                } else {
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
                setIsTokenExpired(true);
                forceLogout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [forceLogout, isTokenExpiredCheck]);

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
        }, 5 * 60 * 1000);

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

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};
