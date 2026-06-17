import asyncio
from tavily import TavilyClient
from config import settings


def _search_sync(query: str) -> str:
    """Search the web synchronously"""
    client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    results = client.search(query=query, max_results=5)

    formatted = []

    for res in results["results"]:
        formatted.append(
            f"Title: {res['title']}\nURL: {res['url']}\nSnippet: {res['content'][:300]}\n"
        )

    separator = "\n" + "-" * 80 + "\n"
    return separator.join(formatted)


async def web_search(query: str) -> str:
    """Search the web asynchronously"""
    try:
        return await asyncio.to_thread(_search_sync, query)
    except Exception as e:
        raise Exception(f"Failed to search the web for query {query}: {str(e)}")
