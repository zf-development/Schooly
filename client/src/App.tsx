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
import SubscriptionsPage from "./pages/SubscriptionsPage";
import CalendarPage from "./pages/CalendarPage";
import FileExplorerPage from "./pages/FileExplorerPage";
import NotesPage from "./pages/NotesPage";
import MessagingPage from "./pages/MessagingPage";
import HomeworkSubmissionPage from "./pages/HomeworkSubmissionPage";
import ProjectsPage from "./pages/ProjectsPage";
import CourseNotesPage from "./pages/CourseNotesPage";
import VideoCallPage from "./pages/VideoCallPage";
import { UserProvider } from "./contexts/UserContext";
import { NavbarProvider } from "./contexts/NavbarContext";
import { lightTheme, darkTheme } from "./theme";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import FloatingActionButtons from "./components/FloatingActionButtons";



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
                                        <FileExplorerPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/messaging"
                                element={
                                    <ProtectedRoute>
                                        <MessagingPage />
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

                            <Route
                                path="/homework"
                                element={
                                    <ProtectedRoute>
                                        <HomeworkSubmissionPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/projects"
                                element={
                                    <ProtectedRoute>
                                        <ProjectsPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/course-notes"
                                element={
                                    <ProtectedRoute>
                                        <CourseNotesPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/video-call"
                                element={
                                    <ProtectedRoute>
                                        <VideoCallPage />
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
                        <FloatingActionButtons notificationCount={3} />
                    </Router>
                </NavbarProvider>
            </UserProvider>
        </MantineProvider>
    );
};

export default App;
