from server_py.models import Mandi, CropType, RouteRecommendation, RouteStop, AgentState
from server_py.agents.data_agent import haversine_distance
from server_py.models import SPOILAGE_RATES


def calculate_route_stop(
    from_lat: float,
    from_lng: float,
    mandi: Mandi,
    crop_type: CropType,
    cargo_quantity: float,
    quantity_to_sell: float,
    fuel_cost_per_km: float,
) -> tuple[RouteStop, float]:
    distance = haversine_distance(from_lat, from_lng, mandi.lat, mandi.lng)
    spoilage_rate = SPOILAGE_RATES[crop_type]
    spoilage_loss = cargo_quantity * spoilage_rate * (distance / 100)
    arrived_quantity = max(0, cargo_quantity - spoilage_loss)
    actual_sold = min(quantity_to_sell, arrived_quantity)
    price_per_quintal = mandi.prices.get(crop_type.value, 0)
    gross_revenue = actual_sold * price_per_quintal
    market_fee = gross_revenue * (mandi.marketFeePercent / 100)
    remaining = arrived_quantity - actual_sold

    stop = RouteStop(
        mandi=mandi,
        distanceFromPrevKm=round(distance * 10) / 10,
        quantitySoldQuintals=round(actual_sold * 100) / 100,
        pricePerQuintal=price_per_quintal,
        grossRevenue=round(gross_revenue),
        marketFee=round(market_fee),
        loadingCost=mandi.loadingCost,
        spoilageLossQuintals=round(spoilage_loss * 100) / 100,
        spoilageLossValue=round(spoilage_loss * price_per_quintal),
    )
    return stop, remaining


def generate_single_stop_routes(
    start_lat: float,
    start_lng: float,
    nearby_mandis: list[Mandi],
    crop_type: CropType,
    quantity: float,
    fuel_cost_per_km: float,
) -> list[RouteRecommendation]:
    routes = []
    for idx, mandi in enumerate(nearby_mandis):
        stop, _ = calculate_route_stop(
            start_lat, start_lng, mandi, crop_type, quantity, quantity, fuel_cost_per_km
        )
        total_distance = stop.distanceFromPrevKm
        total_fuel_cost = round(total_distance * fuel_cost_per_km)
        net_profit = stop.grossRevenue - stop.marketFee - stop.loadingCost - total_fuel_cost

        routes.append(
            RouteRecommendation(
                id=idx + 1,
                stops=[stop],
                totalDistanceKm=total_distance,
                totalFuelCost=total_fuel_cost,
                totalRevenue=stop.grossRevenue,
                totalMarketFees=stop.marketFee,
                totalLoadingCosts=stop.loadingCost,
                totalSpoilageLoss=stop.spoilageLossValue,
                netProfit=round(net_profit),
                profitPerQuintal=round(net_profit / quantity),
                explanation="",
                tips=[],
                rank=0,
            )
        )
    return routes


def generate_two_stop_routes(
    start_lat: float,
    start_lng: float,
    nearby_mandis: list[Mandi],
    crop_type: CropType,
    quantity: float,
    fuel_cost_per_km: float,
    max_distance_km: float,
) -> list[RouteRecommendation]:
    routes: list[RouteRecommendation] = []
    id_counter = 1000

    top_mandis = sorted(
        nearby_mandis,
        key=lambda m: m.prices.get(crop_type.value, 0),
        reverse=True,
    )[:8]

    for i, mandi1 in enumerate(top_mandis):
        for j, mandi2 in enumerate(top_mandis):
            if i == j:
                continue

            dist1 = haversine_distance(start_lat, start_lng, mandi1.lat, mandi1.lng)
            dist2 = haversine_distance(mandi1.lat, mandi1.lng, mandi2.lat, mandi2.lng)
            total_dist = dist1 + dist2

            if total_dist > max_distance_km * 1.5:
                continue

            for ratio in [0.3, 0.5, 0.7]:
                qty1 = quantity * ratio

                s1, remaining1 = calculate_route_stop(
                    start_lat, start_lng, mandi1, crop_type, quantity, qty1, fuel_cost_per_km
                )
                s2, _ = calculate_route_stop(
                    mandi1.lat, mandi1.lng, mandi2, crop_type, remaining1, remaining1, fuel_cost_per_km
                )

                total_distance = round((dist1 + dist2) * 10) / 10
                total_fuel_cost = round(total_distance * fuel_cost_per_km)
                total_revenue = s1.grossRevenue + s2.grossRevenue
                total_market_fees = s1.marketFee + s2.marketFee
                total_loading_costs = s1.loadingCost + s2.loadingCost
                total_spoilage_loss = s1.spoilageLossValue + s2.spoilageLossValue
                net_profit = total_revenue - total_market_fees - total_loading_costs - total_fuel_cost

                routes.append(
                    RouteRecommendation(
                        id=id_counter,
                        stops=[s1, s2],
                        totalDistanceKm=total_distance,
                        totalFuelCost=total_fuel_cost,
                        totalRevenue=total_revenue,
                        totalMarketFees=total_market_fees,
                        totalLoadingCosts=total_loading_costs,
                        totalSpoilageLoss=total_spoilage_loss,
                        netProfit=round(net_profit),
                        profitPerQuintal=round(net_profit / quantity),
                        explanation="",
                        tips=[],
                        rank=0,
                    )
                )
                id_counter += 1

    return routes


def planner_agent_node(state: dict) -> dict:
    request = state["request"]
    nearby_mandis = state["nearby_mandis"]

    if not nearby_mandis:
        return {"candidate_routes": []}

    single_routes = generate_single_stop_routes(
        request.startLat,
        request.startLng,
        nearby_mandis,
        request.cropType,
        request.quantityQuintals,
        request.fuelCostPerKm,
    )

    two_stop_routes = []
    if len(nearby_mandis) >= 2:
        two_stop_routes = generate_two_stop_routes(
            request.startLat,
            request.startLng,
            nearby_mandis,
            request.cropType,
            request.quantityQuintals,
            request.fuelCostPerKm,
            request.maxDistanceKm,
        )

    all_routes = single_routes + two_stop_routes
    return {"candidate_routes": all_routes}
