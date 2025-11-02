export const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'À l\'instant';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `Modifié il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `Modifié il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `Modifié il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `Modifié il y a ${diffInMonths} mois`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `Modifié il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
};

