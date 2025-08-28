import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { ColorSchemeScript } from "@mantine/core";
import LoginPage from "./pages/LoginPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import { UserProvider } from "./contexts/UserContext";
import { NavbarProvider } from "./contexts/NavbarContext";
import { lightTheme, darkTheme } from "./theme";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Pages temporaires pour les routes manquantes
const NotesPage = () => (
    <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>📚 Mes Notes</h1>
        <p>Page en cours de développement...</p>
    </div>
);

const CalendarPage = () => (
    <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>📅 Mon Calendrier</h1>
        <p>Page en cours de développement...</p>
    </div>
);

const FilesPage = () => (
    <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>📁 Mes Fichiers</h1>
        <p>Page en cours de développement...</p>
    </div>
);

const SubscriptionsPage = () => (
    <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>🏫 Mes Établissements</h1>
        <p>Page en cours de développement...</p>
    </div>
);

const App: React.FC = () => {
    return (
        <MantineProvider theme={lightTheme} defaultColorScheme="light">
            <ColorSchemeScript />
            <UserProvider>
                <NavbarProvider>
                    <Router>
                        <Routes>
                            {/* Route publique - accessible seulement si non connecté */}
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                }
                            />

                            {/* Routes protégées - accessibles seulement si connecté */}
                            <Route
                                path="/feed"
                                element={
                                    <ProtectedRoute>
                                        <FeedPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Nouvelles routes pour éviter les rafraîchissements */}
                            <Route
                                path="/notes"
                                element={
                                    <ProtectedRoute>
                                        <NotesPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/calendar"
                                element={
                                    <ProtectedRoute>
                                        <CalendarPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/files"
                                element={
                                    <ProtectedRoute>
                                        <FilesPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/subscriptions"
                                element={
                                    <ProtectedRoute>
                                        <SubscriptionsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Redirection par défaut */}
                            <Route
                                path="/"
                                element={<Navigate to="/login" replace />}
                            />
                            <Route
                                path="*"
                                element={<Navigate to="/login" replace />}
                            />
                        </Routes>
                    </Router>
                </NavbarProvider>
            </UserProvider>
        </MantineProvider>
    );
};

export default App;
