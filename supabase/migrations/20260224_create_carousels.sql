-- 1. Tabela de Carrosséis
create table public.carousels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  status text default 'draft', -- draft, published
  slides jsonb not null default '[]'::jsonb, -- Armazena o array de slides
  branding_snapshot jsonb, -- Guarda as cores usadas neste carrossel específico
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar RLS (Row Level Security) - CRÍTICO!
alter table public.carousels enable row level security;

-- 3. Políticas de Segurança (Quem pode fazer o quê?)

-- Política: Usuário só vê seus próprios carrosséis
create policy "Users can view their own carousels" 
on public.carousels for select 
using (auth.uid() = user_id);

-- Política: Usuário pode criar carrosséis (o user_id deve bater com o dele)
create policy "Users can insert their own carousels" 
on public.carousels for insert 
with check (auth.uid() = user_id);

-- Política: Usuário pode editar seus próprios carrosséis
create policy "Users can update their own carousels" 
on public.carousels for update 
using (auth.uid() = user_id);

-- Política: Usuário pode deletar seus próprios carrosséis
create policy "Users can delete their own carousels" 
on public.carousels for delete 
using (auth.uid() = user_id);

-- 4. Index para performance
create index carousels_user_id_idx on public.carousels (user_id);
