-- 1. Tabela de Créditos
create table public.user_credits (
  user_id uuid references auth.users not null primary key,
  credits integer not null default 3,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar RLS
alter table public.user_credits enable row level security;

-- 3. Políticas de Segurança
create policy "Users can view their own credits" 
on public.user_credits for select 
using (auth.uid() = user_id);

-- 4. Gatilho para Crirar Registro de Crédito Automaticamente
-- Nota: Assume-se que existe uma tabela public.profiles onde o user_id é inserido no signup.
-- Se não, podemos atachar ao auth.users.
create or replace function public.handle_new_user_credits()
returns trigger as $$
begin
  insert into public.user_credits (user_id, credits)
  values (new.id, 3);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger disparado quando um novo perfil é criado
create trigger on_profile_created_setup_credits
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_credits();

-- 5. Inserir créditos para usuários existentes (opcional/migração)
insert into public.user_credits (user_id, credits)
select id, 3 from public.profiles
on conflict (user_id) do nothing;
