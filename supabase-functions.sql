-- Function to get leaderboard with user profiles and scores
create or replace function get_leaderboard(limit_param integer default 100)
returns table (
  user_address text,
  name text,
  pfp text,
  total_score bigint,
  rank bigint,
  last_activity timestamp with time zone
)
language sql
as $$
  select
    u.address as user_address,
    u.name,
    u.pfp,
    coalesce(sum(s.points), 0) + (coalesce(mc.count, 0) * 150) as total_score,
    row_number() over (order by (coalesce(sum(s.points), 0) + (coalesce(mc.count, 0) * 150)) desc) as rank,
    greatest(
      coalesce(max(s.created_at), '1970-01-01'::timestamp with time zone),
      coalesce(mc.updated_at, '1970-01-01'::timestamp with time zone)
    ) as last_activity
  from users u
  left join scores s on u.address = s.user_address
  left join mint_counts mc on u.address = mc.user_address
  group by u.address, u.name, u.pfp, mc.count, mc.updated_at
  order by total_score desc
  limit limit_param;
$$;

-- Function to get leaderboard statistics
create or replace function get_leaderboard_stats()
returns table (total_users bigint, total_score bigint)
language sql
as $$
  select
    count(distinct u.address) as total_users,
    coalesce(sum(s.points), 0) + (coalesce(sum(mc.count), 0) * 150) as total_score
  from users u
  left join scores s on u.address = s.user_address
  left join mint_counts mc on u.address = mc.user_address;
$$;

-- Function to get user rank
create or replace function get_user_rank(user_address_param text)
returns table (rank bigint)
language sql
as $$
  with ranked_users as (
    select
      u.address,
      row_number() over (
        order by (coalesce(sum(s.points), 0) + (coalesce(mc.count, 0) * 150)) desc
      ) as user_rank
    from users u
    left join scores s on u.address = s.user_address
    left join mint_counts mc on u.address = mc.user_address
    group by u.address, mc.count
  )
  select user_rank as rank
  from ranked_users
  where address = user_address_param;
$$;

-- Function to get user total points
create or replace function get_user_total_points(user_address_param text)
returns table (total_points bigint)
language sql
as $$
  select
    coalesce(sum(s.points), 0) + (coalesce(mc.count, 0) * 150) as total_points
  from users u
  left join scores s on u.address = s.user_address
  left join mint_counts mc on u.address = mc.user_address
  where u.address = user_address_param
  group by mc.count;
$$;

-- Function to get mint statistics
create or replace function get_mint_stats()
returns table (total_mints bigint, unique_users bigint)
language sql
as $$
  select
    coalesce(sum(count), 0) as total_mints,
    count(*) as unique_users
  from mint_counts
  where count > 0;
$$;

-- Function to increment mint count (call this when user mints)
create or replace function increment_mint_count(user_address_param text)
returns void
language plpgsql
as $$
begin
  -- Ensure user exists
  insert into users (address)
  values (user_address_param)
  on conflict (address) do nothing;

  -- Increment or insert mint count
  insert into mint_counts (user_address, count)
  values (user_address_param, 1)
  on conflict (user_address)
  do update set
    count = mint_counts.count + 1,
    updated_at = timezone('utc'::text, now());
end;
$$;