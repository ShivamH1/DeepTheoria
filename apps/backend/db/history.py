import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
import asyncpg

_pool: Optional[asyncpg.Pool] = None


async def init_db(dsn: str) -> None:
    """Initialize the database pool and create tables if they do not exist."""
    global _pool
    _pool = await asyncpg.create_pool(dsn)

    async with _pool.acquire() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS research_history (
                id              VARCHAR(36) PRIMARY KEY,
                topic           TEXT NOT NULL,
                search_results  TEXT,
                scraped_content TEXT,
                report          TEXT,
                feedback        TEXT,
                created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        """
        )


async def close_db() -> None:
    """Close the database pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def save_research(
    topic: str,
    search_results: str,
    scraped_content: str,
    report: str,
    feedback: str,
) -> str:
    """Save a research history entry and return the generated UUID."""
    if not _pool:
        raise RuntimeError("Database pool not initialized. Call init_db first.")

    record_id = str(uuid.uuid4())
    async with _pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO research_history (id, topic, search_results, scraped_content, report, feedback)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            record_id,
            topic,
            search_results,
            scraped_content,
            report,
            feedback,
        )
    return record_id


async def get_all_history() -> List[Dict[str, Any]]:
    """Retrieve all research history entries summary ordered by created_at desc."""
    if not _pool:
        raise RuntimeError("Database pool not initialized. Call init_db first.")

    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, topic, report, feedback, created_at 
            FROM research_history 
            ORDER BY created_at DESC
            """
        )
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d["created_at"], datetime):
                d["created_at"] = d["created_at"].isoformat()
            result.append(d)
        return result


async def get_history_item(record_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single detailed research history entry by ID."""
    if not _pool:
        raise RuntimeError("Database pool not initialized. Call init_db first.")

    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM research_history WHERE id = $1", record_id
        )
        if row:
            d = dict(row)
            if isinstance(d["created_at"], datetime):
                d["created_at"] = d["created_at"].isoformat()
            return d
        return None


async def delete_history_item(record_id: str) -> bool:
    """Delete a research history entry by ID."""
    if not _pool:
        raise RuntimeError("Database pool not initialized. Call init_db first.")

    async with _pool.acquire() as conn:
        status = await conn.execute(
            "DELETE FROM research_history WHERE id = $1", record_id
        )
        if status.startswith("DELETE"):
            try:
                count = int(status.split()[1])
                return count > 0
            except (IndexError, ValueError):
                pass
        return False
