from typing import Optional
from pydantic import BaseModel


class ResearchResult(BaseModel):
    id: str
    topic: str
    search_results: str
    scraped_content: str
    report: str
    feedback: str
    created_at: Optional[str] = None


class HistoryItem(BaseModel):
    id: str
    topic: str
    report: str
    feedback: str
    created_at: str
