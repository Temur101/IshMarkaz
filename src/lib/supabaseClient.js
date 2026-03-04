import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseAnonKey = '';

try {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    // Debug log (can be removed later)
    if (supabaseUrl && supabaseAnonKey) {
        console.log('Supabase client initializing with URL:', supabaseUrl);
    } else {
        console.error('Supabase keys missing in environment variables!');
    }
} catch (e) {
    console.error('Failed to access environment variables:', e);
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing. Please check your .env file.');
}

// Export a dummy client if variables are missing to prevent immediate crash
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        from: () => ({
            select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
            insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
            update: () => ({ eq: () => ({ select: () => Promise.resolve({ data: [], error: null }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
            on: () => ({ subscribe: () => ({}) })
        }),
        channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
        removeChannel: () => { }
    };
