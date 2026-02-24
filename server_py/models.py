from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class CropType(str, Enum):
    tomato = "tomato"
    onion = "onion"
    potato = "potato"
    cauliflower = "cauliflower"
    cabbage = "cabbage"
    brinjal = "brinjal"
    green_chilli = "green_chilli"
    lady_finger = "lady_finger"
    carrot = "carrot"
    drumstick = "drumstick"


CROP_LABELS = {
    CropType.tomato: "Tomato",
    CropType.onion: "Onion",
    CropType.potato: "Potato",
    CropType.cauliflower: "Cauliflower",
    CropType.cabbage: "Cabbage",
    CropType.brinjal: "Brinjal",
    CropType.green_chilli: "Green Chilli",
    CropType.lady_finger: "Lady Finger",
    CropType.carrot: "Carrot",
    CropType.drumstick: "Drumstick",
}

SPOILAGE_RATES = {
    CropType.tomato: 0.02,
    CropType.onion: 0.005,
    CropType.potato: 0.003,
    CropType.cauliflower: 0.025,
    CropType.cabbage: 0.015,
    CropType.brinjal: 0.018,
    CropType.green_chilli: 0.022,
    CropType.lady_finger: 0.03,
    CropType.carrot: 0.008,
    CropType.drumstick: 0.012,
}


class Mandi(BaseModel):
    id: int
    name: str
    district: str
    state: str
    lat: float
    lng: float
    prices: dict[str, float]
    marketFeePercent: float
    loadingCost: float


class RouteRequest(BaseModel):
    startLat: float = Field(ge=-90, le=90)
    startLng: float = Field(ge=-180, le=180)
    startLocation: str = Field(min_length=1)
    cropType: CropType
    quantityQuintals: float = Field(ge=0.1, le=500)
    maxDistanceKm: float = Field(ge=5, le=500)
    fuelCostPerKm: float = Field(ge=0.5, le=100)


class RouteStop(BaseModel):
    mandi: Mandi
    distanceFromPrevKm: float
    quantitySoldQuintals: float
    pricePerQuintal: float
    grossRevenue: float
    marketFee: float
    loadingCost: float
    spoilageLossQuintals: float
    spoilageLossValue: float


class RouteRecommendation(BaseModel):
    id: int
    stops: list[RouteStop]
    totalDistanceKm: float
    totalFuelCost: float
    totalRevenue: float
    totalMarketFees: float
    totalLoadingCosts: float
    totalSpoilageLoss: float
    netProfit: float
    profitPerQuintal: float
    explanation: str
    tips: list[str]
    rank: int


class RouteResponse(BaseModel):
    routes: list[RouteRecommendation]
    nearbyMandis: list[Mandi]
    cropType: CropType
    quantityQuintals: float


class AgentState(BaseModel):
    request: RouteRequest
    nearby_mandis: list[Mandi] = []
    candidate_routes: list[RouteRecommendation] = []
    ranked_routes: list[RouteRecommendation] = []
    final_routes: list[RouteRecommendation] = []

    class Config:
        arbitrary_types_allowed = True
