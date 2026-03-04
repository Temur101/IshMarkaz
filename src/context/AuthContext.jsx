import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const checkUser = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setUser(session?.user ?? null);
            } catch (err) {
                console.error('Auth Check Error:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Safety timeout to prevent infinite loading/black screen
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        // Listen for changes on auth state (logged in, signed out, etc.)
        let subscription;
        try {
            const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });
            subscription = data.subscription;
        } catch (err) {
            console.error('Auth Subscription Error:', err);
            setLoading(false);
        }

        return () => {
            subscription?.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const signUp = (email, password, options) => {
        return supabase.auth.signUp({ email, password, options });
    };

    const signIn = (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signOut = () => {
        return supabase.auth.signOut();
    };

    const updateProfile = async (data) => {
        // 1. Update Supabase Auth user_metadata (used in Profile.jsx)
        const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({ data });

        if (error) return { user: null, error };

        if (updatedUser) setUser(updatedUser);

        // 2. Also sync to the public profiles table (used by UserProfileModal & MyJobs)
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');

        const profileRow = {
            id: updatedUser.id,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            role: data.role || null,
            occupation: data.role || null,   // keep occupation in sync
            location: data.location || null,
            phone: data.phone || null,
            skills: data.skills || null,
            about: data.about || null,
            social_links: Array.isArray(data.social_links) ? data.social_links : [],
            avatar_url: data.avatar_url || null,
            updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileRow, { onConflict: 'id' });

        if (profileError) {
            console.error('Profile table sync error:', profileError.message);
            // Don't block the user — auth update succeeded
        }

        return { user: updatedUser, error: null };
    };

    const value = { user, loading, signUp, signIn, signOut, updateProfile };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen bg-brand-black flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
