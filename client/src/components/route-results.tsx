import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteCard } from "@/components/route-card";
import { RouteMap } from "@/components/route-map";
import { type RouteResponse, type RouteRequest, cropLabels } from "@shared/schema";
import { Trophy, Map, List, RotateCcw, TrendingUp, AlertCircle, Truck } from "lucide-react";

interface RouteResultsProps {
  results: RouteResponse | null;
  request: RouteRequest | null;
  isLoading: boolean;
  error?: string;
  onReset: () => void;
}

export function RouteResults({ results, request, isLoading, error, onReset }: RouteResultsProps) {
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [view, setView] = useState<"list" | "map">("list");

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4" data-testid="loading-results">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Analyzing Routes...</h2>
            <p className="text-sm text-muted-foreground">Calculating distances, costs, and spoilage for nearby mandis</p>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-card-border">
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <h3 className="font-semibold text-lg">Could not find routes</h3>
            <p className="text-muted-foreground text-sm max-w-md">{error}</p>
            <Button variant="outline" onClick={onReset} data-testid="button-try-again">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results || results.routes.length === 0) {
    return (
      <div className="mt-8">
        <Card className="border-card-border">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <Map className="w-10 h-10 text-muted-foreground" />
            <h3 className="font-semibold text-lg">No routes found</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              No mandis found within your specified distance for this crop. Try increasing the maximum travel distance or changing the crop type.
            </p>
            <Button variant="outline" onClick={onReset} data-testid="button-adjust-search">
              <RotateCcw className="w-4 h-4 mr-2" />
              Adjust Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bestRoute = results.routes[0];

  return (
    <div className="mt-8 space-y-6" data-testid="results-container">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" data-testid="text-results-title">
              Top {results.routes.length} Routes for {cropLabels[results.cropType]}
            </h2>
            <p className="text-sm text-muted-foreground">
              {results.nearbyMandis.length} mandis found nearby &middot; {results.quantityQuintals} quintals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
            <TabsList>
              <TabsTrigger value="list" data-testid="tab-list-view">
                <List className="w-4 h-4 mr-1.5" />
                Routes
              </TabsTrigger>
              <TabsTrigger value="map" data-testid="tab-map-view">
                <Map className="w-4 h-4 mr-1.5" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={onReset} data-testid="button-new-search">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            New Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Best Net Profit"
          value={`Rs ${bestRoute.netProfit.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          highlight
        />
        <StatCard
          label="Best Route Distance"
          value={`${bestRoute.totalDistanceKm.toFixed(1)} km`}
          icon={Truck}
        />
        <StatCard
          label="Stops"
          value={`${bestRoute.stops.length} ${bestRoute.stops.length === 1 ? "mandi" : "mandis"}`}
          icon={Map}
        />
        <StatCard
          label="Profit/Quintal"
          value={`Rs ${bestRoute.profitPerQuintal.toLocaleString("en-IN")}`}
          icon={Trophy}
        />
      </div>

      {view === "list" ? (
        <div className="space-y-4">
          {results.routes.map((route, index) => (
            <RouteCard
              key={route.id}
              route={route}
              index={index}
              isSelected={selectedRoute === index}
              onSelect={() => setSelectedRoute(index)}
              cropType={results.cropType}
            />
          ))}
        </div>
      ) : (
        <Card className="border-card-border">
          <CardContent className="p-0">
            <RouteMap
              routes={results.routes}
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
              startLat={request?.startLat ?? 13.08}
              startLng={request?.startLng ?? 80.27}
              nearbyMandis={results.nearbyMandis}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md p-3 border ${
        highlight
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-card-border"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
