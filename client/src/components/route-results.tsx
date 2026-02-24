import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteCard } from "@/components/route-card";
import { RouteMap } from "@/components/route-map";
import { type RouteResponse, type RouteRequest } from "@shared/schema";
import { Trophy, Map, List, RotateCcw, TrendingUp, AlertCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";
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
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse-glow">
            <Truck className="w-6 h-6 text-primary animate-bounce" style={{animationDuration: "1.5s"}} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t.results.analyzingRoutes}</h2>
            <p className="text-sm text-muted-foreground">{t.results.analyzingSubtitle}</p>
          </div>
        </motion.div>
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <Card className="border-card-border">
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
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
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
        </motion.div>
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center">
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
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label={t.results.bestNetProfit}
          value={`\u20B9${bestRoute.netProfit.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          highlight
          delay={0}
        />
        <StatCard
          label={t.results.bestRouteDistance}
          value={`${bestRoute.totalDistanceKm.toFixed(1)} ${t.form.km}`}
          icon={Truck}
          delay={0.1}
        />
        <StatCard
          label={t.results.stops}
          value={`${bestRoute.stops.length} ${bestRoute.stops.length === 1 ? t.results.mandi : t.results.mandis}`}
          icon={Map}
          delay={0.2}
        />
        <StatCard
          label={t.results.profitPerQuintal}
          value={`\u20B9${bestRoute.profitPerQuintal.toLocaleString("en-IN")}`}
          icon={Trophy}
          delay={0.3}
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-card-border overflow-hidden">
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
        </motion.div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  highlight?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        className={`rounded-xl p-3.5 border transition-all duration-300 hover:shadow-md ${
          highlight
            ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40"
            : "bg-card border-card-border hover:border-primary/20"
        }`}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon className={`w-4 h-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className={`text-sm font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}
