from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END

from server_py.models import Mandi, RouteRecommendation, RouteRequest, RouteResponse
from server_py.agents.data_agent import data_agent_node
from server_py.agents.planner_agent import planner_agent_node
from server_py.agents.cost_agent import cost_agent_node
from server_py.agents.explainer_agent import explainer_agent_node


class GraphState(TypedDict):
    request: RouteRequest
    nearby_mandis: list[Mandi]
    candidate_routes: list[RouteRecommendation]
    ranked_routes: list[RouteRecommendation]
    final_routes: list[RouteRecommendation]


def build_route_graph() -> StateGraph:
    graph = StateGraph(GraphState)

    graph.add_node("data_agent", data_agent_node)
    graph.add_node("planner_agent", planner_agent_node)
    graph.add_node("cost_agent", cost_agent_node)
    graph.add_node("explainer_agent", explainer_agent_node)

    graph.set_entry_point("data_agent")
    graph.add_edge("data_agent", "planner_agent")
    graph.add_edge("planner_agent", "cost_agent")
    graph.add_edge("cost_agent", "explainer_agent")
    graph.add_edge("explainer_agent", END)

    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_route_graph()
    return _compiled_graph


def optimize_routes(request: RouteRequest) -> RouteResponse:
    graph = get_graph()

    initial_state: GraphState = {
        "request": request,
        "nearby_mandis": [],
        "candidate_routes": [],
        "ranked_routes": [],
        "final_routes": [],
    }

    result = graph.invoke(initial_state)

    return RouteResponse(
        routes=result["final_routes"],
        nearbyMandis=result["nearby_mandis"],
        cropType=request.cropType,
        quantityQuintals=request.quantityQuintals,
    )
