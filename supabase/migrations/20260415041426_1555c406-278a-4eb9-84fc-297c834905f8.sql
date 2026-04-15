create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_name text not null,
  row_count integer default 0,
  column_count integer default 0,
  columns jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.datasets enable row level security;

create policy "Users can view own datasets" on public.datasets for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own datasets" on public.datasets for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own datasets" on public.datasets for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own datasets" on public.datasets for delete to authenticated using (auth.uid() = user_id);

create table public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid references public.datasets(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  analysis_type text not null,
  results jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.analysis_results enable row level security;

create policy "Users can view own analysis" on public.analysis_results for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own analysis" on public.analysis_results for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own analysis" on public.analysis_results for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('datasets', 'datasets', false);

create policy "Users can upload dataset files" on storage.objects for insert to authenticated with check (bucket_id = 'datasets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view own dataset files" on storage.objects for select to authenticated using (bucket_id = 'datasets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own dataset files" on storage.objects for delete to authenticated using (bucket_id = 'datasets' and (storage.foldername(name))[1] = auth.uid()::text);