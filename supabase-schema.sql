-- Create users table
create table users (
  id uuid primary key default gen_random_uuid(),
  address text unique not null,
  name text,
  pfp text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create scores table
create table scores (
  id uuid primary key default gen_random_uuid(),
  user_address text not null references users(address) on delete cascade,
  action text not null check (action in ('generate', 'game', 'buy_token', 'hold_token')),
  points integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create mint_counts table
create table mint_counts (
  id uuid primary key default gen_random_uuid(),
  user_address text unique not null references users(address) on delete cascade,
  count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_scores_user_address on scores(user_address);
create index idx_scores_created_at on scores(created_at desc);
create index idx_mint_counts_user_address on mint_counts(user_address);

-- Enable Row Level Security
alter table users enable row level security;
alter table scores enable row level security;
alter table mint_counts enable row level security;

-- Create policies for public read access (adjust as needed for your security requirements)
create policy "users_select_policy" on users for select using (true);
create policy "users_insert_policy" on users for insert with check (true);
create policy "users_update_policy" on users for update using (true);

create policy "scores_select_policy" on scores for select using (true);
create policy "scores_insert_policy" on scores for insert with check (true);

create policy "mint_counts_select_policy" on mint_counts for select using (true);
create policy "mint_counts_insert_policy" on mint_counts for insert with check (true);
create policy "mint_counts_update_policy" on mint_counts for update using (true);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language 'plpgsql';

-- Create triggers for updated_at
create trigger update_users_updated_at before update on users for each row execute procedure update_updated_at_column();
create trigger update_mint_counts_updated_at before update on mint_counts for each row execute procedure update_updated_at_column();