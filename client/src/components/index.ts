// Layout & Structure
export { default as MainLayout } from '../layouts/MainLayout';
export { default as AppHeader } from './Header';
export { default as AppFooter } from './Footer';

// Auth
export { default as AuthButton } from './AuthButton';
export { default as LoginForm } from './LoginForm';

// Feed & Posts
export { default as PostCard } from './PostCard';
export { default as PostForm } from './PostForm';
export { default as FeedList } from './FeedList';
export { default as ReportPostModal } from './ReportPostModal';

// Institutions
// InstitutionSelector supprimé

// Utilitaires
export { default as LoaderOverlay } from './LoaderOverlay';
export { default as ErrorAlert } from './ErrorAlert';
export { default as NotificationToast } from './NotificationToast';

// Theme
export { default as ThemeToggle } from './ThemeToggle';

// Ré-export des types depuis le fichier centralisé
export type { Post, AuthButtonProps, PostFormProps } from '../types';
