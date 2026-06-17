import asyncio
import requests
from bs4 import BeautifulSoup


def _scrape_sync(url: str, limit: int = 3000) -> str:
    """Synchronous scraper for a single URL."""
    response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)[:limit]


async def scrape_page(url: str, limit: int = 3000) -> str:
    """Async wrapper for the synchronous scraper."""
    try:
        return await asyncio.to_thread(_scrape_sync, url, limit)
    except Exception as e:
        raise Exception(f"Failed to scrape {url}: {str(e)}")


async def scrape_multiple(urls: list[str], limit_per_url: int = 1500) -> list[dict]:
    """Scrape multiple URLs concurrently using asyncio.gather."""
    tasks = [scrape_page(url, limit_per_url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [
        {
            "url": url,
            "status": "success" if isinstance(r, str) else "failed",
            "chars": len(r) if isinstance(r, str) else 0,
            "error": None if isinstance(r, str) else str(r),
            "content": r if isinstance(r, str) else "",
        }
        for url, r in zip(urls, results)
    ]
