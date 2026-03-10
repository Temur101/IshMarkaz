
import { createClient } from '@supabase/supabase-client'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
    const { data, error } = await supabase.from('job_interests').select('job_id')
    console.log('Interests data sample:', data?.slice(0, 5))
    console.log('Error:', error)

    // Test count join
    const { data: jobsWithCount, error: countError } = await supabase
        .from('jobs')
        .select('id, title, job_interests(count)')
        .limit(1)

    console.log('Job with interest count:', jobsWithCount)
    console.log('Count Error:', countError)
}

test()
