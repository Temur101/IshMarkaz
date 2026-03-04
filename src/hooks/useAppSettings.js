import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Simple memory cache so we don't fetch settings repeatedly
let cachedSettings = null;
let fetchPromise = null;
let appSettingsChannel = null;
let subscribersCount = 0;

export const useAppSettings = () => {
    const [settings, setSettings] = useState(cachedSettings);
    const [loading, setLoading] = useState(!cachedSettings);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            if (cachedSettings) {
                setSettings(cachedSettings);
                setLoading(false);
                return;
            }

            if (!fetchPromise) {
                fetchPromise = supabase
                    .from('app_settings')
                    .select('logo_url')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()
                    .then(({ data, error }) => {
                        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
                        return data || null;
                    });
            }

            try {
                const data = await fetchPromise;
                if (isMounted) {
                    cachedSettings = data;
                    setSettings(data);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Failed to load app settings:', err);
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        loadSettings();

        // Singleton subscription logic to prevent WebSocket thrashing from multi-mounts
        subscribersCount++;

        if (!appSettingsChannel) {
            appSettingsChannel = supabase
                .channel('app_settings_changes_global')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'app_settings' },
                    async () => {
                        const { data } = await supabase
                            .from('app_settings')
                            .select('logo_url')
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .single();
                        if (data) {
                            cachedSettings = data;
                            // Need to notify all hooks, but here we just update cache. 
                            // Individual components will need to handle local state update, which is complex for a hook.
                            // For simplicity, we just run optimistic updates when cache changes.
                        }
                    }
                )
                .subscribe();
        }

        // Setup local interval to poll cache changes since React state isn't shared across hook instances
        // A simple interval is much lighter than multiple websocket connections
        const syncInterval = setInterval(() => {
            if (isMounted && cachedSettings && cachedSettings.logo_url !== settings?.logo_url) {
                setSettings(cachedSettings);
            }
        }, 1000);

        return () => {
            isMounted = false;
            clearInterval(syncInterval);

            subscribersCount--;
            // Only remove the channel if no components are using it anymore
            // We use timeout to avoid strict-mode instant unmount/remount killing it
            setTimeout(() => {
                if (subscribersCount <= 0 && appSettingsChannel) {
                    supabase.removeChannel(appSettingsChannel);
                    appSettingsChannel = null;
                    subscribersCount = 0;
                }
            }, 1000);
        };
    }, [settings?.logo_url]);

    return { settings, loading, error };
};
