from langgraph.graph import START, END, StateGraph
from nodes import critic_node, reader_node, writer_node, search_node, should_revise
from state import ResearchState


def build_gather_graph():
    """Phases 1-2: search + scrape only.  Stops before writer so HITL review can happen."""
    graph = StateGraph(ResearchState)
    graph.add_node("search", search_node)
    graph.add_node("reader", reader_node)
    graph.add_edge(START, "search")
    graph.add_edge("search", "reader")
    graph.add_edge("reader", END)
    return graph.compile()


def build_write_graph():
    """Phases 3-4: writer + critic with self-correction loop (up to MAX_REVISIONS cycles)."""
    graph = StateGraph(ResearchState)
    graph.add_node("writer", writer_node)
    graph.add_node("critic", critic_node)
    graph.add_edge(START, "writer")
    graph.add_edge("writer", "critic")
    graph.add_conditional_edges(
        "critic",
        should_revise,
        {"writer": "writer", "end": END},
    )
    return graph.compile()


gather_graph = build_gather_graph()
write_graph = build_write_graph()
