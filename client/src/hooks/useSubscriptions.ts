import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';

interface Subscription {
    id: string;
    follower_user_id: string;
    institution_id: string;
    created_at: string;
    institution?: {
        id: string;
        name: string;
        logoUrl?: string;
        description?: string;
    };
}

interface UseSubscriptionsReturn {
    subscriptions: Subscription[];
    loading: boolean;
    error: string | null;
    refreshSubscriptions: () => Promise<void>;
    subscriptionCount: number;
}

export const useSubscriptions = (): UseSubscriptionsReturn => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await subscriptionService.list();
            
            let subscriptionsData: Subscription[] = [];
            
            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    subscriptionsData = response.data;
                } else if ((response.data as any).subscriptions) {
                    subscriptionsData = Array.isArray((response.data as any).subscriptions)
                        ? (response.data as any).subscriptions
                        : [];
                }
            } else if ((response as any).subscriptions) {
                subscriptionsData = Array.isArray((response as any).subscriptions)
                    ? (response as any).subscriptions
                    : [];
            }

            setSubscriptions(subscriptionsData);
        } catch (err) {
            console.error('Erreur lors du chargement des abonnements:', err);
            setError('Erreur lors du chargement des abonnements');
        } finally {
            setLoading(false);
        }
    };

    const refreshSubscriptions = async () => {
        await loadSubscriptions();
    };

    useEffect(() => {
        loadSubscriptions();
    }, []);

    return {
        subscriptions,
        loading,
        error,
        refreshSubscriptions,
        subscriptionCount: subscriptions.length,
    };
};
