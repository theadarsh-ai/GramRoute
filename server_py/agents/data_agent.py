import json
import math
import os
from server_py.models import Mandi, CropType, AgentState


DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "mandis.json")

_mandis_cache: list[Mandi] | None = None


def load_mandis() -> list[Mandi]:
    global _mandis_cache
    if _mandis_cache is not None:
        return _mandis_cache
    with open(DATA_PATH, "r") as f:
        raw = json.load(f)
    _mandis_cache = [Mandi(**m) for m in raw]
    return _mandis_cache


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def filter_mandis_by_radius(
    start_lat: float, start_lng: float, max_distance_km: float, crop_type: CropType
) -> list[Mandi]:
    all_mandis = load_mandis()
    result = []
    for m in all_mandis:
        dist = haversine_distance(start_lat, start_lng, m.lat, m.lng)
        if dist <= max_distance_km and crop_type.value in m.prices:
            result.append(m)
    return result


def data_agent_node(state: dict) -> dict:
    request = state["request"]
    nearby = filter_mandis_by_radius(
        request.startLat,
        request.startLng,
        request.maxDistanceKm,
        request.cropType,
    )
    return {"nearby_mandis": nearby}
