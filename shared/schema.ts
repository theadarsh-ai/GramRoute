import { z } from "zod";

export const cropTypes = [
  "tomato",
  "onion",
  "potato",
  "cauliflower",
  "cabbage",
  "brinjal",
  "green_chilli",
  "lady_finger",
  "carrot",
  "drumstick",
] as const;

export type CropType = (typeof cropTypes)[number];

export const cropLabels: Record<CropType, string> = {
  tomato: "Tomato",
  onion: "Onion",
  potato: "Potato",
  cauliflower: "Cauliflower",
  cabbage: "Cabbage",
  brinjal: "Brinjal",
  green_chilli: "Green Chilli",
  lady_finger: "Lady Finger",
  carrot: "Carrot",
  drumstick: "Drumstick",
};

export const spoilageRates: Record<CropType, number> = {
  tomato: 0.02,
  onion: 0.005,
  potato: 0.003,
  cauliflower: 0.025,
  cabbage: 0.015,
  brinjal: 0.018,
  green_chilli: 0.022,
  lady_finger: 0.03,
  carrot: 0.008,
  drumstick: 0.012,
};

export interface Mandi {
  id: number;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  prices: Partial<Record<CropType, number>>;
  marketFeePercent: number;
  loadingCost: number;
}

export const routeRequestSchema = z.object({
  startLat: z.number().min(-90).max(90),
  startLng: z.number().min(-180).max(180),
  startLocation: z.string().min(1),
  cropType: z.enum(cropTypes),
  quantityQuintals: z.number().min(0.1).max(500),
  maxDistanceKm: z.number().min(5).max(500),
  fuelCostPerKm: z.number().min(0.5).max(100),
});

export type RouteRequest = z.infer<typeof routeRequestSchema>;

export interface RouteStop {
  mandi: Mandi;
  distanceFromPrevKm: number;
  quantitySoldQuintals: number;
  pricePerQuintal: number;
  grossRevenue: number;
  marketFee: number;
  loadingCost: number;
  spoilageLossQuintals: number;
  spoilageLossValue: number;
}

export interface RouteRecommendation {
  id: number;
  stops: RouteStop[];
  totalDistanceKm: number;
  totalFuelCost: number;
  totalRevenue: number;
  totalMarketFees: number;
  totalLoadingCosts: number;
  totalSpoilageLoss: number;
  netProfit: number;
  profitPerQuintal: number;
  explanation: string;
  tips: string[];
  rank: number;
}

export interface RouteResponse {
  routes: RouteRecommendation[];
  nearbyMandis: Mandi[];
  cropType: CropType;
  quantityQuintals: number;
}

export const users = undefined;
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
