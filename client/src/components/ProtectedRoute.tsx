import React from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import AuthVerificationScreen from "./AuthVerificationScreen";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useUserContext();

    // Afficher l'écran de vérification pendant la vérification
    if (isLoading) {
        return <AuthVerificationScreen type="protected" />;
    }

    // Si pas d'utilisateur connecté, rediriger vers login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si connecté, afficher le contenu protégé
    return <>{children}</>;
};

export default ProtectedRoute;
