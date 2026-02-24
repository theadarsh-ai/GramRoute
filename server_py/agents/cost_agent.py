from server_py.models import RouteRecommendation


def rank_and_deduplicate(routes: list[RouteRecommendation]) -> list[RouteRecommendation]:
    sorted_routes = sorted(routes, key=lambda r: r.netProfit, reverse=True)

    seen: set[str] = set()
    unique: list[RouteRecommendation] = []

    for route in sorted_routes:
        key = (
            "-".join(str(s.mandi.id) for s in route.stops)
            + "-"
            + "-".join(str(round(s.quantitySoldQuintals)) for s in route.stops)
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(route)
        if len(unique) >= 5:
            break

    top_routes = []
    for idx, route in enumerate(unique[:3]):
        ranked = route.model_copy(update={"id": idx + 1, "rank": idx + 1})
        top_routes.append(ranked)

    return top_routes


def cost_agent_node(state: dict) -> dict:
    candidate_routes = state["candidate_routes"]

    if not candidate_routes:
        return {"ranked_routes": []}

    ranked = rank_and_deduplicate(candidate_routes)
    return {"ranked_routes": ranked}
