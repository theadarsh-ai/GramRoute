import { MapPin, TrendingUp, Truck, Leaf } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function FarmScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-6 right-[10%] w-20 h-20 md:w-28 md:h-28 animate-pulse-glow rounded-full">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-35">
          <circle cx="50" cy="50" r="30" fill="hsl(32 95% 55%)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + 45 * Math.cos((angle * Math.PI) / 180)}
              y2={50 + 45 * Math.sin((angle * Math.PI) / 180)}
              stroke="hsl(32 95% 55%)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.6"
            />
          ))}
        </svg>
      </div>

      {[
        { top: "10%", left: "3%", size: "w-12 h-12", color: "text-primary/30", anim: "animate-float", delay: "0s" },
        { top: "20%", left: "15%", size: "w-8 h-8", color: "text-primary/25", anim: "animate-drift", delay: "1s" },
        { top: "8%", left: "30%", size: "w-10 h-10", color: "text-chart-2/30", anim: "animate-float-slow", delay: "0.5s" },
        { top: "30%", left: "8%", size: "w-7 h-7", color: "text-primary/20", anim: "animate-float", delay: "2.5s" },
        { top: "15%", left: "75%", size: "w-11 h-11", color: "text-primary/25", anim: "animate-float-slow", delay: "1.5s" },
        { top: "25%", left: "88%", size: "w-9 h-9", color: "text-chart-2/25", anim: "animate-drift", delay: "3s" },
        { top: "40%", left: "92%", size: "w-7 h-7", color: "text-primary/20", anim: "animate-float", delay: "0.8s" },
        { top: "35%", left: "45%", size: "w-6 h-6", color: "text-chart-2/20", anim: "animate-drift", delay: "2s" },
        { top: "45%", left: "20%", size: "w-8 h-8", color: "text-primary/20", anim: "animate-float-slow", delay: "3.5s" },
        { top: "5%", left: "55%", size: "w-9 h-9", color: "text-chart-2/25", anim: "animate-float", delay: "1.2s" },
        { top: "50%", left: "70%", size: "w-6 h-6", color: "text-primary/15", anim: "animate-drift", delay: "4s" },
        { top: "38%", left: "60%", size: "w-10 h-10", color: "text-chart-2/20", anim: "animate-float-slow", delay: "2.8s" },
      ].map((leaf, i) => (
        <svg key={i} className={`absolute ${leaf.size} ${leaf.color} ${leaf.anim}`} style={{top: leaf.top, left: leaf.left, animationDelay: leaf.delay}} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      ))}

      <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end opacity-[0.12]">
        {Array.from({length: 12}).map((_, i) => (
          <svg key={i} className="animate-sway w-8 md:w-12 h-24 md:h-36" style={{animationDelay: `${i * 0.3}s`}} viewBox="0 0 40 120" fill="none">
            <path d="M20 120 L20 30" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <ellipse cx="20" cy="30" rx="6" ry="12" fill="currentColor" className="text-chart-2" transform="rotate(-15 20 30)" />
            <ellipse cx="20" cy="45" rx="5" ry="10" fill="currentColor" className="text-chart-2" transform="rotate(15 20 45)" />
            <ellipse cx="20" cy="58" rx="4" ry="9" fill="currentColor" className="text-chart-2" transform="rotate(-10 20 58)" />
            <ellipse cx="20" cy="15" rx="5" ry="14" fill="currentColor" className="text-chart-2" />
          </svg>
        ))}
      </div>

      <svg className="absolute bottom-0 left-0 right-0 w-full h-32 opacity-[0.08]" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,80 C200,20 400,100 600,60 C800,20 1000,80 1200,40 V120 H0 Z" fill="currentColor" className="text-primary" />
        <path d="M0,100 C150,60 350,110 550,80 C750,50 950,100 1200,70 V120 H0 Z" fill="currentColor" className="text-chart-2" />
      </svg>

      <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}} />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-chart-2/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}} />
      <div className="absolute top-1/2 right-[20%] w-64 h-64 bg-chart-4/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "10s", animationDelay: "4s"}} />
    </div>
  );
}

export function HeroSection() {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden farm-gradient pb-28 pt-8 animate-gradient-shift" style={{backgroundSize: "200% 200%"}}>
      <FarmScene />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-6 py-10 md:py-16">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-bounce-in backdrop-blur-sm">
            <Leaf className="w-4 h-4 text-primary animate-sway" />
            <span className="text-sm font-medium text-primary">{t.hero.badge}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 bg-clip-text text-transparent">Gram</span>
            <span>Route</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4 w-full max-w-2xl">
            <FeatureChip icon={MapPin} label={t.hero.chip50Mandis} delay={0} />
            <FeatureChip icon={TrendingUp} label={t.hero.chipProfitOptimizer} delay={0.1} />
            <FeatureChip icon={Truck} label={t.hero.chipRoutePlanner} delay={0.2} />
            <FeatureChip icon={Leaf} label={t.hero.chipSpoilageAware} delay={0.3} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureChip({ icon: Icon, label, delay }: { icon: typeof MapPin; label: string; delay: number }) {
  return (
    <div 
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg glass-card border border-primary/10 text-sm group hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-bounce-in cursor-default" 
      style={{animationDelay: `${delay + 0.3}s`, opacity: 0}}
      data-testid={`chip-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Icon className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
      <span className="text-muted-foreground group-hover:text-foreground transition-colors truncate">{label}</span>
    </div>
  );
}
