import React, { useState } from 'react';
import { useAppSettings } from '../../hooks/useAppSettings';
import { Loader2, ImageOff } from 'lucide-react';

export const Logo = ({ className = "h-16 w-auto object-contain transition-transform group-hover:scale-105" }) => {
    const { settings, loading, error } = useAppSettings();
    const [imgError, setImgError] = useState(false);

    // Fallback logo path
    const DEFAULT_LOGO = "/favicon.png";

    // If we are loading and don't have a cached URL yet, or if there's an error
    // we show the default logo immediately instead of a loader to make it feel "instant"
    const logoSrc = (!loading && !error && !imgError && settings?.logo_url)
        ? settings.logo_url
        : DEFAULT_LOGO;

    return (
        <img
            src={logoSrc}
            alt="IshMarkaz"
            className={className}
            onError={() => {
                // If the remote logo fails, we fall back to the local one
                if (logoSrc !== DEFAULT_LOGO) {
                    setImgError(true);
                }
            }}
        />
    );
};
