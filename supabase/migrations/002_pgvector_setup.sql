-- ============================================================
-- AI Study Partner - pgvector Extension & Material Chunks
-- ============================================================

-- Enable pgvector
create extension if not exists vector;

-- 6. Material Chunks (RAG)
create table public.material_chunks (
  id uuid default gen_random_uuid() primary key,
  material_id uuid not null references materials(id) on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(384),
  section_heading text,
  char_start int not null,
  char_end int not null,
  token_count int,
  created_at timestamptz not null default now(),
  unique(material_id, chunk_index)
);

create index idx_chunks_material on material_chunks(material_id);
create index idx_chunks_embedding on material_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
