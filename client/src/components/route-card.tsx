import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type RouteRecommendation, type CropType } from "@shared/schema";
import {
  Trophy,
  MapPin,
  Fuel,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Store,
  CircleDollarSign,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface RouteCardProps {
  route: RouteRecommendation;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  cropType: CropType;
}

const rankColors = [
  "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  "bg-gray-400/10 text-gray-600 dark:text-gray-400 border-gray-400/20",
  "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
];

export function RouteCard({ route, index, isSelected, onSelect, cropType }: RouteCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const maxProfit = route.totalRevenue;
  const profitPercent = maxProfit > 0 ? (route.netProfit / maxProfit) * 100 : 0;
  const { t } = useI18n();

  return (
    <Card
      className={`border-card-border transition-all cursor-pointer ${
        isSelected ? "ring-2 ring-primary/30" : ""
      }`}
      onClick={onSelect}
      data-testid={`card-route-${index}`}
    >
      <CardContent className="p-0">
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-9 h-9 rounded-md border text-sm font-bold ${rankColors[index] || "bg-muted text-muted-foreground border-border"}`}>
                #{index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {route.stops.map((stop, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                      <span className="font-medium text-sm">{stop.mandi.name}</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {route.stops.map((s) => s.mandi.district).join(" > ")} &middot; {route.totalDistanceKm.toFixed(1)} {t.form.km}
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-primary" data-testid={`text-profit-${index}`}>
                Rs {route.netProfit.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">{t.card.netProfit}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{t.card.profitEfficiency}</span>
              <span className="text-xs font-medium">{profitPercent.toFixed(0)}%</span>
            </div>
            <Progress value={profitPercent} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <MiniStat icon={CircleDollarSign} label={t.card.revenue} value={`Rs ${route.totalRevenue.toLocaleString("en-IN")}`} />
            <MiniStat icon={Fuel} label={t.card.fuel} value={`-Rs ${route.totalFuelCost.toLocaleString("en-IN")}`} negative />
            <MiniStat icon={Store} label={t.card.marketFees} value={`-Rs ${route.totalMarketFees.toLocaleString("en-IN")}`} negative />
            <MiniStat icon={TrendingDown} label={t.card.spoilage} value={`-Rs ${route.totalSpoilageLoss.toLocaleString("en-IN")}`} negative />
          </div>

          <button
            className="flex items-center justify-center gap-1 w-full mt-3 pt-3 border-t text-xs text-muted-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            data-testid={`button-expand-${index}`}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> {t.card.hideDetails}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> {t.card.showDetails}
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 md:px-5 md:pb-5 space-y-4 border-t pt-4">
                <div className="bg-primary/5 rounded-md p-3 border border-primary/10">
                  <p className="text-sm text-foreground leading-relaxed" data-testid={`text-explanation-${index}`}>
                    {route.explanation}
                  </p>
                </div>

                {route.tips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-chart-2" />
                      {t.card.tipsForYou}
                    </h4>
                    <ul className="space-y-1.5">
                      {route.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-muted-foreground pl-4 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-chart-2/40">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground">{t.card.stopDetails}</h4>
                  {route.stops.map((stop, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{stop.mandi.name}, {stop.mandi.district}</p>
                          <Badge variant="secondary" className="text-[10px]">
                            Rs {stop.pricePerQuintal}{t.card.qtl}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-0.5">
                          {t.card.kmAway.replace("{dist}", stop.distanceFromPrevKm.toFixed(1))} &middot; {t.card.sell.replace("{qty}", stop.quantitySoldQuintals.toFixed(1))} &middot; {t.card.revenueLabel.replace("{amount}", stop.grossRevenue.toLocaleString("en-IN"))}
                        </p>
                        <p className="text-muted-foreground">
                          {t.card.marketFeeLabel.replace("{amount}", stop.marketFee.toLocaleString("en-IN"))} &middot; {t.card.spoilageLabel.replace("{qty}", stop.spoilageLossQuintals.toFixed(2))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  negative,
}: {
  icon: typeof Fuel;
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/50">
      <Icon className={`w-3 h-3 flex-shrink-0 ${negative ? "text-destructive/70" : "text-primary"}`} />
      <div className="min-w-0">
        <p className="text-muted-foreground truncate">{label}</p>
        <p className={`font-medium ${negative ? "text-destructive/80" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
