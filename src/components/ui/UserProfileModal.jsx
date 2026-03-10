import { useState, useEffect } from 'react';
import { X, User, MapPin, Briefcase, Phone, Award, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const UserProfileModal = ({ isOpen, onClose, userId, fallbackName }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchDone, setFetchDone] = useState(false);

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchProfile = async () => {
            setLoading(true);
            setFetchDone(false);
            setProfile(null);

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                console.log('[UserProfileModal] profiles query result:', { data, error, userId });

                if (!error && data) {
                    setProfile(data);
                } else {
                    // RLS might block reading other users' profiles
                    // or profile row simply doesn't exist yet
                    console.warn('[UserProfileModal] Could not load profile:', error?.message || 'No data');
                    setProfile(null);
                }
            } catch (err) {
                console.error('[UserProfileModal] Unexpected error:', err);
                setProfile(null);
            } finally {
                setLoading(false);
                setFetchDone(true);
            }
        };

        fetchProfile();
    }, [isOpen, userId]);

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setProfile(null);
            setFetchDone(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Support both naming conventions:
    // profiles table uses: full_name, username, occupation, location, phone, skills, social_links, about
    // user_metadata uses:  first_name, last_name, role, location, phone, skills, social_links, about
    const displayName = (() => {
        if (!profile) return fallbackName || 'Пользователь';
        // Try full_name first
        if (profile.full_name && profile.full_name.trim()) return profile.full_name.trim();
        // Try first_name + last_name
        const first = profile.first_name || '';
        const last = profile.last_name || '';
        if (first || last) return `${first} ${last}`.trim();
        // Fallback to username (but hide if it looks like an email)
        if (profile.username && !profile.username.includes('@')) return profile.username;
        // Final fallback
        return fallbackName || 'Пользователь';
    })();

    const initial = displayName.charAt(0).toUpperCase();
    const role = profile?.occupation || profile?.role || null;
    const location = profile?.location || null;
    const phone = profile?.phone || null;
    const about = profile?.about || null;

    // Skills: could be comma-string or array
    const rawSkills = profile?.skills || '';
    const skills = Array.isArray(rawSkills)
        ? rawSkills.filter(Boolean)
        : (rawSkills ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : []);

    // Social links: could be array of {platform, value} objects
    const socialLinks = Array.isArray(profile?.social_links) ? profile.social_links : [];

    const hasDetails = role || location || phone || about || skills.length > 0 || socialLinks.length > 0;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal card */}
            <div className="relative w-full max-w-md bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: 'modalIn 0.18s ease' }}>

                <style>{`
                    @keyframes modalIn {
                        from { opacity: 0; transform: scale(0.95) translateY(8px); }
                        to   { opacity: 1; transform: scale(1)   translateY(0); }
                    }
                `}</style>

                {/* Gradient banner */}
                <div className="h-24 bg-gradient-to-r from-brand-orange/30 via-brand-orange/10 to-transparent relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white/60 hover:text-white hover:bg-black/50 transition-all"
                        aria-label="Закрыть"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-6">

                    {/* Avatar + name row */}
                    <div className="flex items-end gap-4 -mt-10 mb-5">
                        <div className="w-20 h-20 rounded-full bg-brand-gray border-4 border-[#0F0F11] flex items-center justify-center text-3xl font-bold text-brand-orange shadow-xl uppercase flex-shrink-0 overflow-hidden">
                            {loading
                                ? <div className="w-7 h-7 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                                : (profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : ((profile || fallbackName) ? initial : <User size={32} className="text-white/20" />))
                            }
                        </div>
                        <div className="pb-1 flex-1 min-w-0">
                            {loading ? (
                                <div className="space-y-2 pt-6">
                                    <div className="h-5 bg-white/10 rounded animate-pulse w-36" />
                                    <div className="h-4 bg-white/5 rounded animate-pulse w-24" />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-white truncate leading-tight pt-6">{displayName}</h2>
                                    {role && (
                                        <p className="text-sm text-brand-orange flex items-center gap-1.5 mt-0.5">
                                            <Briefcase size={13} />
                                            {role}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Profile sections */}
                    {loading && (
                        <div className="space-y-3">
                            <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                                <div className="h-3 bg-white/10 rounded animate-pulse w-24" />
                                <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                            </div>
                        </div>
                    )}

                    {!loading && fetchDone && (
                        <>
                            {/* About */}
                            {about && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-3">
                                    <p className="text-sm text-brand-muted leading-relaxed italic">"{about}"</p>
                                </div>
                            )}

                            {/* Personal info block */}
                            {(location || phone) && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3 mb-3">
                                    <h3 className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
                                        Личная информация
                                    </h3>
                                    {location && (
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <MapPin size={14} className="text-brand-orange flex-shrink-0" />
                                            <span className="text-white/80">{location}</span>
                                        </div>
                                    )}
                                    {phone && (
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <Phone size={14} className="text-brand-orange flex-shrink-0" />
                                            <span className="text-white/80">{phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Skills */}
                            {skills.length > 0 && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-3">
                                    <h3 className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Award size={13} /> Навыки
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, i) => (
                                            <span key={i}
                                                className="px-3 py-1 text-xs font-medium bg-brand-orange/15 text-brand-orange border border-brand-orange/30 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Social links */}
                            {socialLinks.length > 0 && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-3">
                                    <h3 className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <LinkIcon size={13} /> Социальные сети
                                    </h3>
                                    <div className="space-y-2">
                                        {socialLinks.map((link, idx) => (
                                            <div key={idx}
                                                className="flex items-center justify-between text-sm bg-black/20 rounded-lg px-3 py-2">
                                                <span className="font-semibold text-brand-orange text-xs">{link.platform}</span>
                                                <span className="text-white/70 text-xs">{link.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state — profile loaded but no details */}
                            {profile && !hasDetails && (
                                <div className="text-center py-6 text-brand-muted text-sm italic">
                                    Пользователь не заполнил профиль
                                </div>
                            )}

                            {/* No profile found at all (RLS or missing row) */}
                            {!profile && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                    <User size={32} className="mx-auto mb-2 text-white/10" />
                                    <p className="text-sm text-brand-muted">
                                        Профиль пользователя недоступен
                                    </p>
                                    <p className="text-xs text-white/20 mt-1">
                                        Пользователь ещё не заполнил свой профиль
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
