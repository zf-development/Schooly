import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ColorSchemeScript } from '@mantine/core';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import { UserProvider } from './contexts/UserContext';
import { lightTheme, darkTheme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

const App: React.FC = () => {
    return (
        <MantineProvider theme={lightTheme} defaultColorScheme="light">
            <ColorSchemeScript />
            <UserProvider>
                <Router>
                    <Routes>
                        {/* Route publique - accessible seulement si non connecté */}
                        <Route path="/login" element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        } />

                        {/* Routes protégées - accessibles seulement si connecté */}
                        <Route path="/feed" element={
                            <ProtectedRoute>
                                <FeedPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        } />

                        {/* Redirection par défaut */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </UserProvider>
        </MantineProvider>
    );
};

export default App;
