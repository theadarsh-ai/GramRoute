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

const rankConfig = [
  { bg: "bg-gradient-to-br from-yellow-400/20 to-amber-500/10", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-500/30", icon: "1", glow: "shadow-yellow-500/10" },
  { bg: "bg-gradient-to-br from-gray-300/20 to-gray-400/10", text: "text-gray-600 dark:text-gray-400", border: "border-gray-400/30", icon: "2", glow: "" },
  { bg: "bg-gradient-to-br from-orange-400/20 to-amber-600/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/30", icon: "3", glow: "" },
];

export function RouteCard({ route, index, isSelected, onSelect, cropType }: RouteCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const maxProfit = route.totalRevenue;
  const profitPercent = maxProfit > 0 ? (route.netProfit / maxProfit) * 100 : 0;
  const { t } = useI18n();
  const rank = rankConfig[index] || { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: `${index + 1}`, glow: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
    >
      <Card
        className={`border-card-border transition-all duration-300 cursor-pointer hover:shadow-lg ${
          isSelected ? "ring-2 ring-primary/30 shadow-md" : "hover:border-primary/20"
        } ${index === 0 ? "animate-pulse-glow" : ""}`}
        onClick={onSelect}
        data-testid={`card-route-${index}`}
      >
        <CardContent className="p-0">
          <div className={`p-4 md:p-5 ${index === 0 ? "animate-shimmer" : ""}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg border ${rank.bg} ${rank.text} ${rank.border} text-sm font-bold ${rank.glow}`}>
                  #{rank.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {route.stops.map((stop, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                        <span className="font-semibold text-sm">{stop.mandi.name}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {route.stops.map((s) => s.mandi.district).join(" \u2192 ")} · {route.totalDistanceKm.toFixed(1)} {t.form.km}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={`text-xl font-bold ${index === 0 ? "text-primary" : "text-foreground"}`} data-testid={`text-profit-${index}`}>
                  \u20B9{route.netProfit.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">{t.card.netProfit}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t.card.profitEfficiency}</span>
                <span className="text-xs font-medium">{profitPercent.toFixed(0)}%</span>
              </div>
              <div className="relative">
                <Progress value={profitPercent} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <MiniStat icon={CircleDollarSign} label={t.card.revenue} value={`\u20B9${route.totalRevenue.toLocaleString("en-IN")}`} />
              <MiniStat icon={Fuel} label={t.card.fuel} value={`-\u20B9${route.totalFuelCost.toLocaleString("en-IN")}`} negative />
              <MiniStat icon={Store} label={t.card.marketFees} value={`-\u20B9${route.totalMarketFees.toLocaleString("en-IN")}`} negative />
              <MiniStat icon={TrendingDown} label={t.card.spoilage} value={`-\u20B9${route.totalSpoilageLoss.toLocaleString("en-IN")}`} negative />
            </div>

            <button
              className="flex items-center justify-center gap-1 w-full mt-3 pt-3 border-t text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 md:px-5 md:pb-5 space-y-4 border-t pt-4">
                  <div className="bg-gradient-to-r from-primary/5 to-chart-2/5 rounded-lg p-4 border border-primary/10">
                    <p className="text-sm text-foreground leading-relaxed" data-testid={`text-explanation-${index}`}>
                      {route.explanation}
                    </p>
                  </div>

                  {route.tips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-chart-2" />
                        {t.card.tipsForYou}
                      </h4>
                      <ul className="space-y-2">
                        {route.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground pl-5 relative">
                            <Lightbulb className="w-3 h-3 text-chart-2 absolute left-0 top-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-medium text-muted-foreground">{t.card.stopDetails}</h4>
                    {route.stops.map((stop, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">{stop.mandi.name}, {stop.mandi.district}</p>
                            <Badge variant="secondary" className="text-[10px] font-bold">
                              \u20B9{stop.pricePerQuintal}{t.card.qtl}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {t.card.kmAway.replace("{dist}", stop.distanceFromPrevKm.toFixed(1))} · {t.card.sell.replace("{qty}", stop.quantitySoldQuintals.toFixed(1))} · {t.card.revenueLabel.replace("{amount}", stop.grossRevenue.toLocaleString("en-IN"))}
                          </p>
                          <p className="text-muted-foreground">
                            {t.card.marketFeeLabel.replace("{amount}", stop.marketFee.toLocaleString("en-IN"))} · {t.card.spoilageLabel.replace("{qty}", stop.spoilageLossQuintals.toFixed(2))}
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
    </motion.div>
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
    <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${negative ? "text-destructive/70" : "text-primary"}`} />
      <div className="min-w-0">
        <p className="text-muted-foreground truncate">{label}</p>
        <p className={`font-semibold ${negative ? "text-destructive/80" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
