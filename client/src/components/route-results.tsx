import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteCard } from "@/components/route-card";
import { RouteMap } from "@/components/route-map";
import { type RouteResponse, type RouteRequest } from "@shared/schema";
import { Trophy, Map, List, RotateCcw, TrendingUp, AlertCircle, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4" data-testid="loading-results">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t.results.analyzingRoutes}</h2>
            <p className="text-sm text-muted-foreground">{t.results.analyzingSubtitle}</p>
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
            <h3 className="font-semibold text-lg">{t.results.couldNotFind}</h3>
            <p className="text-muted-foreground text-sm max-w-md">{error}</p>
            <Button variant="outline" onClick={onReset} data-testid="button-try-again">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t.results.tryAgain}
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
            <h3 className="font-semibold text-lg">{t.results.noRoutesFound}</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {t.results.noRoutesDesc}
            </p>
            <Button variant="outline" onClick={onReset} data-testid="button-adjust-search">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t.results.adjustSearch}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bestRoute = results.routes[0];
  const cropName = t.crops[results.cropType as keyof typeof t.crops] || results.cropType;

  return (
    <div className="mt-8 space-y-6" data-testid="results-container">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" data-testid="text-results-title">
              {t.results.topRoutes.replace("{count}", String(results.routes.length)).replace("{crop}", cropName)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.results.mandisFound.replace("{count}", String(results.nearbyMandis.length))} &middot; {results.quantityQuintals} {t.form.quintals}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
            <TabsList>
              <TabsTrigger value="list" data-testid="tab-list-view">
                <List className="w-4 h-4 mr-1.5" />
                {t.results.routes}
              </TabsTrigger>
              <TabsTrigger value="map" data-testid="tab-map-view">
                <Map className="w-4 h-4 mr-1.5" />
                {t.results.map}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={onReset} data-testid="button-new-search">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            {t.results.newSearch}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label={t.results.bestNetProfit}
          value={`Rs ${bestRoute.netProfit.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          highlight
        />
        <StatCard
          label={t.results.bestRouteDistance}
          value={`${bestRoute.totalDistanceKm.toFixed(1)} ${t.form.km}`}
          icon={Truck}
        />
        <StatCard
          label={t.results.stops}
          value={`${bestRoute.stops.length} ${bestRoute.stops.length === 1 ? t.results.mandi : t.results.mandis}`}
          icon={Map}
        />
        <StatCard
          label={t.results.profitPerQuintal}
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
