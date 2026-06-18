from langgraph.graph import START, END, StateGraph
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from graph.nodes import critic_node, reader_node, writer_node, search_node, should_revise
from graph.state import ResearchState


def build_research_graph(checkpointer: AsyncPostgresSaver):
    graph = StateGraph(ResearchState)
    graph.add_node("search", search_node)
    graph.add_node("reader", reader_node)
    graph.add_node("writer", writer_node)
    graph.add_node("critic", critic_node)
    graph.add_edge(START, "search")
    graph.add_edge("search", "reader")
    graph.add_edge("reader", "writer")
    graph.add_edge("writer", "critic")
    graph.add_conditional_edges(
        "critic",
        should_revise,
        {"writer": "writer", "end": END},
    )
    return graph.compile(
        checkpointer=checkpointer,
        interrupt_before=["writer"],
    )
