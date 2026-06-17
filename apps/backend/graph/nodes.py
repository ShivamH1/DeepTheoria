import re

from langchain_mistralai import ChatMistralAI
from config import settings

from state import ResearchState
from tools.scraper import scrape_multiple
from tools.search import web_search
from prompt import writer_prompt, critic_prompt

MAX_REVISIONS = 1

llm = ChatMistralAI(
    model=settings.MISTRAL_MODEL, temperature=0, api_key=settings.MISTRAL_API_KEY
)


def extract_score(feedback: str) -> int:
    """
    Extract the score from the critic's feedback string.
    """
    match = re.search(r"Score:\s*(\d+)\s*/\s*10", feedback, re.IGNORECASE)
    return int(match.group(1)) if match else 0


def should_revise(state: ResearchState) -> str:
    """Routing function: send back to writer if score is low and budget remains."""
    if state.get("error"):
        return "end"
    score = extract_score(state.get("feedback", ""))

    revision_count = state.get("revision_count", 0)

    if score < 6 and revision_count < MAX_REVISIONS:
        return "writer"
    return "end"


async def search_node(state: ResearchState) -> dict:
    """
    Search the web for the given topic.
    """
    if state.get("error"):
        return {}
    try:
        results = await web_search(state["topic"])
        return {"search_results": results, "phase": 1}
    except Exception as e:
        return {"error": str(e), "phase": 1, "search_results": ""}


async def reader_node(state: ResearchState) -> dict:
    """
    Read the results return from search node.
    """
    if state.get("error"):
        return {}

    try:
        urls = re.findall(r"URL: (https?://\S+)", state["search_results"])
        top_urls = urls[:5]

        if not top_urls:
            return {
                "scraped_content": "No URLs found in search results.",
                "scraped_sources": [],
                "phase": 2,
            }

        sources = await scrape_multiple(top_urls, limit_per_url=5)

        combined = [
            f"[Source: {s['url']}]\n{s['content']}"
            for s in sources
            if s["status"] == "success" and s["content"]
        ]

        scraped_content = "\n\n---\n\n".join(combined) or "No content could be scraped."

        sources_meta = [
            {
                "url": s["url"],
                "status": s["status"],
                "chars": s["chars"],
                "error": s["error"],
            }
            for s in sources
        ]
        return {
            "scraped_content": scraped_content,
            "scraped_sources": sources_meta,
            "phase": 2,
        }
    except Exception as e:
        return {
            "error": str(e),
            "phase": 2,
            "scraped_content": "",
            "scraped_sources": [],
        }


async def writer_node(state: ResearchState) -> dict:
    """
    Writer node for creating report on research based on web search and scraped results.
    """
    if state.get("error"):
        return {}

    try:
        prev_feedback = state.get("feedback", "")
        revision_count = state.get("revision_count", 0)

        revision_instruction = ""
        if prev_feedback:
            revision_count += 1
            revision_instruction = (
                f"Previous critique (revision attempt {revision_count}):\n"
                f"{prev_feedback}\n\n"
                "Please address the critique's concerns in this revised version."
            )

        research_combined = (
            f"SEARCH RESULTS:\n{state['search_results']}\n\n"
            f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
        )

        messages = writer_prompt.format_messages(
            topic=state["topic"],
            research=research_combined,
            revision_instruction=revision_instruction,
        )

        result = await llm.ainvoke(messages)

        return {"report": result.content, "phase": 3, "revision_count": revision_count}

    except Exception as e:
        return {"error": str(e), "phase": 3, "report": ""}


async def critic_node(state: ResearchState) -> dict:
    """
    Provides a feedback for the report generated.
    """

    if state.get("error"):
        return {}

    try:
        messages = critic_prompt.format_messages(report=state["report"])
        result = await llm.ainvoke(messages)

        return {"feedback": result.content, "phase": 4}
    except Exception as e:
        return {"error": str(e), "phase": 4, "feedback": ""}
