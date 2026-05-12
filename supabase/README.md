# Supabase Migrations

Apply these migrations in order to set up the database schema.

## Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in the Supabase dashboard
3. Run each migration file in order:

```
20250101000001_init_schema.sql     -- Core tables (profiles, materials, sessions, weak_spots, garden_stats)
20250101000002_pgvector.sql        -- pgvector extension + material_chunks table
20250101000003_rls_policies.sql    -- Row Level Security policies
20250101000004_triggers.sql        -- Auto-create profile on signup, word count triggers
20250101000005_rpc_functions.sql   -- match_chunks RPC + record_study_day RPC
```

## Verification

After applying all migrations, verify with:

```sql
select tablename from pg_tables where schemaname = 'public' order by tablename;
```

Expected output: `garden_stats`, `material_chunks`, `materials`, `profiles`, `study_sessions`, `weak_spots`

## Seed Data

Optionally run `seed.sql` to insert test data for development.
