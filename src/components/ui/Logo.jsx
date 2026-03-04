import React, { useState } from 'react';
import { useAppSettings } from '../../hooks/useAppSettings';
import { Loader2, ImageOff } from 'lucide-react';

export const Logo = ({ className = "h-16 w-auto object-contain transition-transform group-hover:scale-105" }) => {
    const { settings, loading, error } = useAppSettings();
    const [imgError, setImgError] = useState(false);

    // Add a unique timestamp to bypass browser and Supabase CDN caching
    const [cacheBuster] = useState(Date.now());

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-white/5 rounded-xl animate-pulse ${className.replace('object-contain', '')}`}>
                <Loader2 className="w-5 h-5 animate-spin text-brand-orange/50" />
            </div>
        );
    }

    // If there is an error fetching the URL, or the image fails to load, or the URL is missing
    if (error || imgError || !settings?.logo_url) {
        return (
            <div className={`flex items-center justify-center bg-white/5 border border-white/10 rounded-xl ${className.replace('object-contain', '')}`} title="Логотип отсутствует">
                <ImageOff className="w-6 h-6 text-white/20" />
            </div>
        );
    }

    return (
        <img
            src={`${settings.logo_url}?t=${cacheBuster}`}
            alt="IshMarkaz"
            className={className}
            onError={() => setImgError(true)}
        />
    );
};
