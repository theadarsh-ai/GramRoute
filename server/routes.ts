import type { Express } from "express";
import { createServer, type Server } from "http";
import { routeRequestSchema } from "@shared/schema";
import { optimizeRoutes } from "./route-optimizer";
import { mandis } from "./data/mandis";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/recommend-route", (req, res) => {
    try {
      const parsed = routeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input: " + parsed.error.errors.map((e) => e.message).join(", "),
        });
      }

      const result = optimizeRoutes(parsed.data);

      if (result.routes.length === 0) {
        return res.status(200).json(result);
      }

      return res.json(result);
    } catch (error: any) {
      console.error("Route optimization error:", error);
      return res.status(500).json({ message: "Failed to calculate routes. Please try again." });
    }
  });

  app.get("/api/mandis", (_req, res) => {
    return res.json(mandis);
  });

  return httpServer;
}
