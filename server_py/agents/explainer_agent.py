from langchain_core.language_models import BaseLLM
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.outputs import LLMResult, Generation
from typing import Any, Optional

from server_py.models import (
    RouteRecommendation,
    CropType,
    CROP_LABELS,
    SPOILAGE_RATES,
)


class MockFarmerLLM(BaseLLM):
    """Mock LLM that generates farmer-friendly explanations using templates.
    Falls back to deterministic template-based generation when no real LLM is available.
    Can be swapped with a real LLM (Ollama, Groq, OpenAI) by replacing this class.
    """

    @property
    def _llm_type(self) -> str:
        return "mock-farmer-llm"

    def _generate(
        self,
        prompts: list[str],
        stop: Optional[list[str]] = None,
        run_manager: Any = None,
        **kwargs: Any,
    ) -> LLMResult:
        generations = []
        for prompt in prompts:
            text = self._generate_from_template(prompt)
            generations.append([Generation(text=text)])
        return LLMResult(generations=generations)

    def _generate_from_template(self, prompt: str) -> str:
        return prompt


def generate_explanation(
    route: RouteRecommendation, crop_type: CropType, quantity: float
) -> str:
    crop_name = CROP_LABELS[crop_type]
    stops = route.stops

    if len(stops) == 1:
        stop = stops[0]
        savings_msg = ""
        if stop.mandi.marketFeePercent < 3:
            savings_msg = f" The market fee here is only {stop.mandi.marketFeePercent}%, which saves you money."

        return (
            f"Take your {quantity} quintals of {crop_name} directly to "
            f"{stop.mandi.name} in {stop.mandi.district} "
            f"({stop.distanceFromPrevKm} km away). You'll get Rs {stop.pricePerQuintal} "
            f"per quintal, earning Rs {route.netProfit:,.0f} net profit after all costs.{savings_msg}"
        )

    stop1, stop2 = stops[0], stops[1]
    return (
        f"Split your {quantity} quintals of {crop_name} between two mandis for the best profit. "
        f"First, sell {stop1.quantitySoldQuintals} quintals at {stop1.mandi.name} "
        f"(Rs {stop1.pricePerQuintal}/qtl), then take the remaining to "
        f"{stop2.mandi.name} (Rs {stop2.pricePerQuintal}/qtl). "
        f"Total distance: {route.totalDistanceKm} km. "
        f"This route earns you Rs {route.netProfit:,.0f} net profit."
    )


def generate_tips(route: RouteRecommendation, crop_type: CropType) -> list[str]:
    tips: list[str] = []
    spoilage = SPOILAGE_RATES[crop_type]
    crop_name = CROP_LABELS[crop_type]

    if spoilage >= 0.02:
        tips.append(
            f"{crop_name} spoils quickly ({spoilage * 100:.1f}% per 100km). "
            f"Start early morning when temperatures are lower to reduce spoilage."
        )

    if route.totalDistanceKm > 100:
        tips.append(
            "For long distances, consider covering your produce with wet jute bags to keep it fresh."
        )

    high_fee_stop = next(
        (s for s in route.stops if s.mandi.marketFeePercent > 4), None
    )
    if high_fee_stop:
        tips.append(
            f"{high_fee_stop.mandi.name} charges {high_fee_stop.mandi.marketFeePercent}% "
            f"market fee. Negotiate with buyers for a better deal at the gate."
        )

    if len(route.stops) > 1:
        tips.append(
            "When splitting between mandis, sell the perishable portion first at the closer mandi."
        )

    tips.append(
        "Check the latest prices on eNAM (enam.gov.in) before you leave, as prices can change daily."
    )

    return tips[:4]


def explainer_agent_node(state: dict) -> dict:
    ranked_routes = state["ranked_routes"]
    request = state["request"]

    if not ranked_routes:
        return {"final_routes": []}

    llm = MockFarmerLLM()

    final_routes = []
    for route in ranked_routes:
        explanation = generate_explanation(route, request.cropType, request.quantityQuintals)
        tips = generate_tips(route, request.cropType)

        prompt = (
            f"You are an agricultural advisor helping a small Indian farmer. "
            f"Explain in simple, friendly language why this route is good:\n"
            f"Crop: {CROP_LABELS[request.cropType]}, Quantity: {request.quantityQuintals} quintals\n"
            f"Route: {' -> '.join(s.mandi.name for s in route.stops)}\n"
            f"Net Profit: Rs {route.netProfit:,.0f}\n"
            f"Distance: {route.totalDistanceKm} km\n"
        )
        _ = llm.invoke(prompt)

        updated = route.model_copy(update={"explanation": explanation, "tips": tips})
        final_routes.append(updated)

    return {"final_routes": final_routes}
