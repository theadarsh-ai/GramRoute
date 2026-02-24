import { mandis } from "./data/mandis";
import { spoilageRates, type CropType, type Mandi, type RouteRequest, type RouteRecommendation, type RouteStop, type RouteResponse, cropLabels } from "@shared/schema";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function filterMandisByRadius(startLat: number, startLng: number, maxDistanceKm: number, cropType: CropType): Mandi[] {
  return mandis.filter((m) => {
    const dist = haversineDistance(startLat, startLng, m.lat, m.lng);
    return dist <= maxDistanceKm && m.prices[cropType] !== undefined;
  });
}

function calculateRouteStop(
  fromLat: number,
  fromLng: number,
  mandi: Mandi,
  cropType: CropType,
  cargoQuantity: number,
  quantityToSell: number,
  fuelCostPerKm: number
): { stop: RouteStop; remainingAfter: number } {
  const distance = haversineDistance(fromLat, fromLng, mandi.lat, mandi.lng);
  const spoilageRate = spoilageRates[cropType];
  const spoilageLoss = cargoQuantity * spoilageRate * (distance / 100);
  const arrivedQuantity = Math.max(0, cargoQuantity - spoilageLoss);
  const actualSold = Math.min(quantityToSell, arrivedQuantity);
  const pricePerQuintal = mandi.prices[cropType] || 0;
  const grossRevenue = actualSold * pricePerQuintal;
  const marketFee = grossRevenue * (mandi.marketFeePercent / 100);
  const remaining = arrivedQuantity - actualSold;

  return {
    stop: {
      mandi,
      distanceFromPrevKm: Math.round(distance * 10) / 10,
      quantitySoldQuintals: Math.round(actualSold * 100) / 100,
      pricePerQuintal,
      grossRevenue: Math.round(grossRevenue),
      marketFee: Math.round(marketFee),
      loadingCost: mandi.loadingCost,
      spoilageLossQuintals: Math.round(spoilageLoss * 100) / 100,
      spoilageLossValue: Math.round(spoilageLoss * pricePerQuintal),
    },
    remainingAfter: remaining,
  };
}

function generateSingleStopRoutes(
  startLat: number,
  startLng: number,
  nearbyMandis: Mandi[],
  cropType: CropType,
  quantity: number,
  fuelCostPerKm: number
): RouteRecommendation[] {
  return nearbyMandis.map((mandi, idx) => {
    const { stop } = calculateRouteStop(startLat, startLng, mandi, cropType, quantity, quantity, fuelCostPerKm);
    const totalDistance = stop.distanceFromPrevKm;
    const totalFuelCost = Math.round(totalDistance * fuelCostPerKm);

    const netProfit = stop.grossRevenue - stop.marketFee - stop.loadingCost - totalFuelCost;

    return {
      id: idx + 1,
      stops: [stop],
      totalDistanceKm: totalDistance,
      totalFuelCost,
      totalRevenue: stop.grossRevenue,
      totalMarketFees: stop.marketFee,
      totalLoadingCosts: stop.loadingCost,
      totalSpoilageLoss: stop.spoilageLossValue,
      netProfit: Math.round(netProfit),
      profitPerQuintal: Math.round(netProfit / quantity),
      explanation: "",
      tips: [],
      rank: 0,
    };
  });
}

function generateTwoStopRoutes(
  startLat: number,
  startLng: number,
  nearbyMandis: Mandi[],
  cropType: CropType,
  quantity: number,
  fuelCostPerKm: number,
  maxDistanceKm: number
): RouteRecommendation[] {
  const routes: RouteRecommendation[] = [];
  let idCounter = 1000;

  const topMandis = nearbyMandis
    .map((m) => ({ m, price: m.prices[cropType] || 0 }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 8)
    .map((x) => x.m);

  for (let i = 0; i < topMandis.length; i++) {
    for (let j = 0; j < topMandis.length; j++) {
      if (i === j) continue;

      const mandi1 = topMandis[i];
      const mandi2 = topMandis[j];

      const dist1 = haversineDistance(startLat, startLng, mandi1.lat, mandi1.lng);
      const dist2 = haversineDistance(mandi1.lat, mandi1.lng, mandi2.lat, mandi2.lng);
      const totalDist = dist1 + dist2;

      if (totalDist > maxDistanceKm * 1.5) continue;

      const splitRatios = [0.3, 0.5, 0.7];
      for (const ratio of splitRatios) {
        const qty1 = quantity * ratio;

        const { stop: s1, remainingAfter: remaining1 } = calculateRouteStop(startLat, startLng, mandi1, cropType, quantity, qty1, fuelCostPerKm);
        const { stop: s2 } = calculateRouteStop(mandi1.lat, mandi1.lng, mandi2, cropType, remaining1, remaining1, fuelCostPerKm);

        const totalDistance = Math.round((dist1 + dist2) * 10) / 10;
        const totalFuelCost = Math.round(totalDistance * fuelCostPerKm);
        const totalRevenue = s1.grossRevenue + s2.grossRevenue;
        const totalMarketFees = s1.marketFee + s2.marketFee;
        const totalLoadingCosts = s1.loadingCost + s2.loadingCost;
        const totalSpoilageLoss = s1.spoilageLossValue + s2.spoilageLossValue;
        const netProfit = totalRevenue - totalMarketFees - totalLoadingCosts - totalFuelCost;

        routes.push({
          id: idCounter++,
          stops: [s1, s2],
          totalDistanceKm: totalDistance,
          totalFuelCost,
          totalRevenue,
          totalMarketFees,
          totalLoadingCosts,
          totalSpoilageLoss,
          netProfit: Math.round(netProfit),
          profitPerQuintal: Math.round(netProfit / quantity),
          explanation: "",
          tips: [],
          rank: 0,
        });
      }
    }
  }

  return routes;
}

function generateExplanation(route: RouteRecommendation, cropType: CropType, quantity: number): string {
  const cropName = cropLabels[cropType];
  const stops = route.stops;

  if (stops.length === 1) {
    const stop = stops[0];
    const savingsFromLowFee = stop.mandi.marketFeePercent < 3 ? ` The market fee here is only ${stop.mandi.marketFeePercent}%, which saves you money.` : "";
    return `Take your ${quantity} quintals of ${cropName} directly to ${stop.mandi.name} in ${stop.mandi.district} (${stop.distanceFromPrevKm} km away). You'll get Rs ${stop.pricePerQuintal} per quintal, earning Rs ${route.netProfit.toLocaleString("en-IN")} net profit after all costs.${savingsFromLowFee}`;
  }

  const stop1 = stops[0];
  const stop2 = stops[1];
  const betterPrice = stop1.pricePerQuintal > stop2.pricePerQuintal ? stop1 : stop2;
  const closerStop = stop1.distanceFromPrevKm < stop2.distanceFromPrevKm ? stop1 : stop2;

  return `Split your ${quantity} quintals of ${cropName} between two mandis for the best profit. First, sell ${stop1.quantitySoldQuintals} quintals at ${stop1.mandi.name} (Rs ${stop1.pricePerQuintal}/qtl), then take the remaining to ${stop2.mandi.name} (Rs ${stop2.pricePerQuintal}/qtl). Total distance: ${route.totalDistanceKm} km. This route earns you Rs ${route.netProfit.toLocaleString("en-IN")} net profit.`;
}

function generateTips(route: RouteRecommendation, cropType: CropType): string[] {
  const tips: string[] = [];
  const spoilage = spoilageRates[cropType];

  if (spoilage >= 0.02) {
    tips.push(`${cropLabels[cropType]} spoils quickly (${(spoilage * 100).toFixed(1)}% per 100km). Start early morning when temperatures are lower to reduce spoilage.`);
  }

  if (route.totalDistanceKm > 100) {
    tips.push("For long distances, consider covering your produce with wet jute bags to keep it fresh.");
  }

  const highFeeStop = route.stops.find((s) => s.mandi.marketFeePercent > 4);
  if (highFeeStop) {
    tips.push(`${highFeeStop.mandi.name} charges ${highFeeStop.mandi.marketFeePercent}% market fee. Negotiate with buyers for a better deal at the gate.`);
  }

  if (route.stops.length > 1) {
    tips.push("When splitting between mandis, sell the perishable portion first at the closer mandi.");
  }

  tips.push("Check the latest prices on eNAM (enam.gov.in) before you leave, as prices can change daily.");

  return tips.slice(0, 4);
}

export function optimizeRoutes(request: RouteRequest): RouteResponse {
  const { startLat, startLng, cropType, quantityQuintals, maxDistanceKm, fuelCostPerKm } = request;

  const nearbyMandis = filterMandisByRadius(startLat, startLng, maxDistanceKm, cropType);

  if (nearbyMandis.length === 0) {
    return { routes: [], nearbyMandis: [], cropType, quantityQuintals };
  }

  const singleRoutes = generateSingleStopRoutes(startLat, startLng, nearbyMandis, cropType, quantityQuintals, fuelCostPerKm);
  const twoStopRoutes = nearbyMandis.length >= 2
    ? generateTwoStopRoutes(startLat, startLng, nearbyMandis, cropType, quantityQuintals, fuelCostPerKm, maxDistanceKm)
    : [];

  const allRoutes = [...singleRoutes, ...twoStopRoutes]
    .sort((a, b) => b.netProfit - a.netProfit);

  const seen = new Set<string>();
  const uniqueRoutes: RouteRecommendation[] = [];
  for (const route of allRoutes) {
    const key = route.stops.map((s) => s.mandi.id).join("-") + "-" + route.stops.map((s) => s.quantitySoldQuintals.toFixed(0)).join("-");
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRoutes.push(route);
    if (uniqueRoutes.length >= 5) break;
  }

  const topRoutes = uniqueRoutes.slice(0, 3).map((route, index) => ({
    ...route,
    id: index + 1,
    rank: index + 1,
    explanation: generateExplanation(route, cropType, quantityQuintals),
    tips: generateTips(route, cropType),
  }));

  return {
    routes: topRoutes,
    nearbyMandis,
    cropType,
    quantityQuintals,
  };
}
