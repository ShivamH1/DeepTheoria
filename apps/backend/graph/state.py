from typing import Optional, TypedDict


class ResearchState(TypedDict):
    topic: str
    search_results: str
    scraped_content: str
    scraped_sources: list
    report: str
    feedback: str
    phase: int
    revision_count: int
    error: Optional[str]
