import { MapPin, TrendingUp, Truck, Leaf } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 pb-24 pt-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-[0.03]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 Q150,100 300,60 T600,60 T900,60 T1200,60 V120 H0 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-6 py-8 md:py-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Mandi Route Optimizer</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            <span className="text-primary">Gram</span>Route
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            Maximize your farming profits with smart mandi route recommendations.
            We consider transport costs, spoilage, market fees, and real-time prices.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4 w-full max-w-2xl">
            <FeatureChip icon={MapPin} label="50+ Mandis" />
            <FeatureChip icon={TrendingUp} label="Profit Optimizer" />
            <FeatureChip icon={Truck} label="Route Planner" />
            <FeatureChip icon={Leaf} label="Spoilage Aware" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-card-border text-sm" data-testid={`chip-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-muted-foreground truncate">{label}</span>
    </div>
  );
}
