-- Create Storage Bucket
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- Create storage policy to allow public access to 'branding' bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'branding' );

-- Create App Settings Table
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  logo_url text not null,
  created_at timestamp with time zone default now()
);

-- Insert default row
insert into public.app_settings (logo_url)
values ('https://bnkigahaygtqqbjayqza.supabase.co/storage/v1/object/public/branding/logo.png')
on conflict do nothing;

-- Allow anonymous read access to app_settings
alter table public.app_settings enable row level security;

create policy "Allow public read access to app_settings"
on public.app_settings for select
to anon, authenticated
using (true);

-- Enable realtime for app_settings so the app can update logo automatically without reload
alter publication supabase_realtime add table public.app_settings;
