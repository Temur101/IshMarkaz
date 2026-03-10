import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase. Will fall back to empty client if keys missing 
// but in production Vercel environments these should be set.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).end();
        return;
    }

    try {
        // Fetch all jobs
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('id');

        if (error) {
            console.error('Error fetching jobs for sitemap:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const domain = 'https://ish-markaz.uz';

        // Generate XML string
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${domain}/</loc>
</url>
<url>
<loc>${domain}/jobs/all</loc>
</url>
${jobs ? jobs.map(job => `<url>
<loc>${domain}/jobs/${job.id}</loc>
</url>`).join('\n') : ''}
</urlset>`;

        // Ensure proper Content-Type for XML
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).send(xml.trim());

    } catch (err) {
        console.error('Unexpected error generating sitemap:', err);
        res.status(500).end();
    }
}
