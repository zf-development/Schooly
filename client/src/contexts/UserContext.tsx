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
    institution_id?: string;
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
                    const userInstitution = userData.user.institution;

                    const finalUser = {
                        id: userData.user.id,
                        email: userData.user.email,
                        name: userData.user.display_name || userData.user.name || "Utilisateur",
                        avatar_url: userData.user.avatar_url,
                        institution_id: userData.user.institution_id ?? undefined,
                        institution: userInstitution ? {
                            id: userInstitution.id,
                            name: userInstitution.name
                        } : undefined,
                    };

                    setUser(finalUser);
                    setIsTokenExpired(false);
                } else if (response.status === 401) {
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

    // Recharger l'institution si elle est manquante mais que institution_id existe
    useEffect(() => {
        const reloadInstitution = async () => {
            if (!user || !user.institution_id) {
                return; // Pas besoin de recharger si l'utilisateur ou l'institution_id n'existent pas
            }

            if (user.institution && user.institution.name) {
                return;
            }

            try {
                const token = localStorage.getItem("authToken");
                if (!token) return;

                const institutionResponse = await fetch(
                    `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/institutions/${user.institution_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (institutionResponse.ok) {
                    const institutionData = await institutionResponse.json();

                    if (institutionData.success && institutionData.data) {
                        const userInstitution = institutionData.data;

                        setUser((prevUser) => {
                            if (!prevUser || prevUser.id !== user.id) return prevUser;
                            return {
                                ...prevUser,
                                institution: {
                                    id: userInstitution.id,
                                    name: userInstitution.name,
                                },
                            };
                        });
                    }
                }
            } catch (error) {
                // Erreur silencieuse
            }
        };

        // Attendre un petit délai pour éviter les problèmes de timing
        const timeoutId = setTimeout(() => {
            reloadInstitution();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [user?.id, user?.institution_id]);

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            const token = localStorage.getItem("authToken");
            if (token && isTokenExpiredCheck(token)) {
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
