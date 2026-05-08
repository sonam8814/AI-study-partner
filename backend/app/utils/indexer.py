from __future__ import annotations

from loguru import logger

from app.db.client import get_supabase
from app.core.embeddings import embed_batch
from app.utils.chunker import chunk_markdown


def index_material(material_id: str, user_id: str) -> int:
    """
    Chunk + embed a material and write chunks to material_chunks.
    Returns number of chunks inserted.

    Steps per PRD §10.5:
      1. Delete existing chunks for this material
      2. chunk_markdown → list[Chunk]
      3. embed_batch all chunk contents
      4. Bulk insert into material_chunks
      5. Set materials.is_indexed = true
    """
    db = get_supabase()

    # 1. Fetch markdown content
    resp = (
        db.table("materials")
        .select("markdown_content")
        .eq("id", material_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if resp is None or not resp.data:
        logger.warning(f"[index] material {material_id} not found, skipping")
        return 0

    content: str = resp.data.get("markdown_content", "")
    if not content.strip():
        logger.info(f"[index] material {material_id} has no content, skipping")
        return 0

    # 2. Delete old chunks
    db.table("material_chunks").delete().eq("material_id", material_id).execute()

    # 3. Chunk
    chunks = chunk_markdown(content)
    if not chunks:
        logger.info(f"[index] material {material_id} produced 0 chunks")
        return 0

    # 4. Embed
    texts = [c.content for c in chunks]
    embeddings = embed_batch(texts)

    # 5. Bulk insert
    rows = [
        {
            "material_id": material_id,
            "user_id": user_id,
            "chunk_index": i,
            "content": chunk.content,
            "embedding": embedding,
            "section_heading": chunk.section_heading,
            "char_start": chunk.char_start,
            "char_end": chunk.char_end,
            "token_count": chunk.token_count,
        }
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]
    db.table("material_chunks").insert(rows).execute()

    # 6. Mark indexed
    db.table("materials").update({"is_indexed": True}).eq("id", material_id).execute()

    logger.info(f"[index] material {material_id} → {len(chunks)} chunks indexed")
    return len(chunks)
