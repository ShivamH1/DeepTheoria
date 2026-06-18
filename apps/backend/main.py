import asyncio
import json
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.types import Command
from sse_starlette.sse import EventSourceResponse

from config import settings
from db.history import (
    init_db,
    close_db,
    delete_history_item,
    get_all_history,
    get_history_item,
    save_research,
)

from graph.graph import build_research_graph
from graph.nodes import MAX_REVISIONS, extract_score

PHASE_NAMES = {1: "search", 2: "scrape", 3: "write", 4: "critique"}

# Tracks approval signals for pending HITL reviews.
# State is in the Postgres checkpointer; only the signal lives here.
_pending_reviews: dict[str, asyncio.Event] = {}

research_graph = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global research_graph
    await init_db(settings.DATABASE_URL)
    async with AsyncPostgresSaver.from_conn_string(
        settings.DATABASE_URL
    ) as checkpointer:
        await checkpointer.setup()
        research_graph = build_research_graph(checkpointer)
        yield
    await close_db()


app = FastAPI(title="DeepTheoria API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/research/stream")
async def stream_research(topic: str = Query(..., min_length=1, max_length=500)):
    thread_id = str(uuid.uuid4())
    approval_event = asyncio.Event()

    async def event_generator():
        _pending_reviews[thread_id] = approval_event
        thread_config = {"configurable": {"thread_id": thread_id}}

        try:
            initial_state = {
                "topic": topic,
                "search_results": "",
                "scraped_content": "",
                "scraped_sources": [],
                "report": "",
                "feedback": "",
                "phase": 0,
                "revision_count": 0,
                "error": None,
            }

            # ── GATHER PHASE ─────────────────────────────────────────────────
            # Runs search → reader; stops naturally at interrupt_before=["writer"]
            async for state in research_graph.astream(
                initial_state, config=thread_config, stream_mode="values"
            ):
                phase = state.get("phase", 0)
                if phase == 0:
                    continue
                if state.get("error"):
                    yield {
                        "data": json.dumps({"error": state["error"], "phase": phase})
                    }
                    return
                yield {
                    "data": json.dumps(
                        {
                            "phase": phase,
                            "phase_name": PHASE_NAMES.get(phase, ""),
                            "done": False,
                        }
                    )
                }

            # ── HITL REVIEW ──────────────────────────────────────────────────
            # Restore gathered state from the checkpoint (no manual state dict needed)
            snapshot = await research_graph.aget_state(thread_config)
            gathered = snapshot.values

            if not gathered or gathered.get("error"):
                return

            yield {
                "data": json.dumps(
                    {
                        "phase": "awaiting_review",
                        "done": False,
                        "thread_id": thread_id,
                        "search_results": gathered.get("search_results", ""),
                        "scraped_content": gathered.get("scraped_content", ""),
                        "scraped_sources": gathered.get("scraped_sources", []),
                    }
                )
            }

            try:
                await asyncio.wait_for(approval_event.wait(), timeout=600.0)
            except asyncio.TimeoutError:
                yield {
                    "data": json.dumps(
                        {
                            "error": "Review timed out after 10 minutes. Please start a new research.",
                            "phase": "awaiting_review",
                        }
                    )
                }
                return

            # ── WRITE PHASE ──────────────────────────────────────────────────
            # Resume from the checkpoint; no write_initial dict needed.
            accumulated_state: dict = dict(gathered)

            async for event in research_graph.astream_events(
                None, config=thread_config, version="v2"
            ):
                evt_type = event.get("event", "")
                node = event.get("metadata", {}).get("langgraph_node", "")

                if evt_type == "on_chat_model_stream" and node == "writer":
                    chunk = event.get("data", {}).get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        yield {
                            "data": json.dumps(
                                {
                                    "type": "token",
                                    "phase": 3,
                                    "content": chunk.content,
                                }
                            )
                        }

                elif evt_type == "on_chain_end" and node in ("writer", "critic"):
                    output = event.get("data", {}).get("output") or {}
                    if not isinstance(output, dict) or not output:
                        continue
                    if output.get("error"):
                        yield {
                            "data": json.dumps(
                                {
                                    "error": output["error"],
                                    "phase": output.get("phase", 3),
                                }
                            )
                        }
                        return

                    accumulated_state.update(output)
                    phase = output.get("phase", 0)
                    revision_count = accumulated_state.get("revision_count", 0)

                    if phase == 3:
                        yield {
                            "data": json.dumps(
                                {
                                    "type": "phase_complete",
                                    "phase": 3,
                                    "phase_name": "write",
                                    "done": False,
                                    "revision_count": revision_count,
                                }
                            )
                        }

                    elif phase == 4:
                        score = extract_score(accumulated_state.get("feedback", ""))
                        will_revise = score < 6 and revision_count < MAX_REVISIONS

                        if will_revise:
                            yield {
                                "data": json.dumps(
                                    {
                                        "type": "phase_complete",
                                        "phase": 4,
                                        "phase_name": "critique",
                                        "done": False,
                                        "revision_triggered": True,
                                        "revision_count": revision_count,
                                        "score": score,
                                    }
                                )
                            }
                        else:
                            record_id = await save_research(
                                topic=accumulated_state["topic"],
                                search_results=accumulated_state["search_results"],
                                scraped_content=accumulated_state["scraped_content"],
                                report=accumulated_state["report"],
                                feedback=accumulated_state["feedback"],
                            )
                            yield {
                                "data": json.dumps(
                                    {
                                        "type": "phase_complete",
                                        "phase": 4,
                                        "phase_name": "critique",
                                        "done": True,
                                        "revision_count": revision_count,
                                        "data": {
                                            "id": record_id,
                                            "topic": accumulated_state["topic"],
                                            "search_results": accumulated_state[
                                                "search_results"
                                            ],
                                            "scraped_content": accumulated_state[
                                                "scraped_content"
                                            ],
                                            "report": accumulated_state["report"],
                                            "feedback": accumulated_state["feedback"],
                                        },
                                    }
                                )
                            }

        except asyncio.CancelledError:
            pass
        finally:
            _pending_reviews.pop(thread_id, None)

    return EventSourceResponse(
        event_generator(),
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache, no-transform"},
    )


@app.post("/api/research/approve/{thread_id}")
async def approve_research(thread_id: str):
    event = _pending_reviews.get(thread_id)
    if not event:
        raise HTTPException(status_code=404, detail="No pending review for this thread")
    event.set()
    return {"success": True}


@app.get("/api/history")
async def list_history():
    return await get_all_history()


@app.get("/api/history/{record_id}")
async def get_history(record_id: str):
    item = await get_history_item(record_id)
    if not item:
        raise HTTPException(status_code=404, detail="Research record not found")
    return item


@app.delete("/api/history/{record_id}")
async def delete_history(record_id: str):
    deleted = await delete_history_item(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Research record not found")
    return {"success": True}
