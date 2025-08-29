import React from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import AuthVerificationScreen from "./AuthVerificationScreen";

interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { user, isLoading } = useUserContext();

    // Afficher l'écran de vérification pendant la vérification
    if (isLoading) {
        return <AuthVerificationScreen type="public" />;
    }

    // Si utilisateur connecté, rediriger vers le feed
    if (user) {
        return <Navigate to="/feed" replace />;
    }

    // Si pas connecté, afficher la page publique (login)
    return <>{children}</>;
};

export default PublicRoute;
