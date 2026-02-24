import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { HeroSection } from "@/components/hero-section";
import { RouteForm } from "@/components/route-form";
import { RouteResults } from "@/components/route-results";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import type { RouteRequest, RouteResponse } from "@shared/schema";

export default function Home() {
  const [results, setResults] = useState<RouteResponse | null>(null);
  const [request, setRequest] = useState<RouteRequest | null>(null);
  const { t } = useI18n();

  const mutation = useMutation({
    mutationFn: async (data: RouteRequest) => {
      const res = await apiRequest("POST", "/api/recommend-route", data);
      return res.json() as Promise<RouteResponse>;
    },
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const handleSubmit = (data: RouteRequest) => {
    setRequest(data);
    mutation.mutate(data);
  };

  const handleReset = () => {
    setResults(null);
    setRequest(null);
    mutation.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-foreground">GramRoute</span>
          <LanguageSwitcher />
        </div>
      </nav>

      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative -mt-16 z-10">
          <RouteForm
            onSubmit={handleSubmit}
            isLoading={mutation.isPending}
            error={mutation.error?.message}
          />
        </div>

        {(results || mutation.isPending || mutation.error) && (
          <RouteResults
            results={results}
            request={request}
            isLoading={mutation.isPending}
            error={mutation.error?.message}
            onReset={handleReset}
          />
        )}
      </div>

      <footer className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-semibold text-foreground">GramRoute</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t.hero.subtitle.split(".")[0]}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
