import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { routeRequestSchema, cropTypes, type RouteRequest } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Wheat, Package, Route, Fuel, LocateFixed, Loader2, AlertCircle, Search, CheckCircle2 } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface RouteFormProps {
  onSubmit: (data: RouteRequest) => void;
  isLoading: boolean;
  error?: string;
}

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

const POPULAR_CITIES = [
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", lat: 9.9252, lng: 78.1198 },
];

export function RouteForm({ onSubmit, isLoading, error }: RouteFormProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(true);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const form = useForm<RouteRequest>({
    resolver: zodResolver(routeRequestSchema),
    defaultValues: {
      startLat: 13.0827,
      startLng: 80.2707,
      startLocation: "Chennai",
      cropType: "tomato",
      quantityQuintals: 10,
      maxDistanceKm: 150,
      fuelCostPerKm: 12,
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    setShowDropdown(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", India")}&limit=5&countrycodes=in`
      );
      const data: GeoResult[] = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleLocationInput = (value: string, onChange: (v: string) => void) => {
    onChange(value);
    setLocationConfirmed(false);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchLocation(value);
    }, 400);
  };

  const selectLocation = (name: string, lat: number, lng: number) => {
    form.setValue("startLocation", name);
    form.setValue("startLat", parseFloat(lat.toFixed(4)));
    form.setValue("startLng", parseFloat(lng.toFixed(4)));
    setLocationConfirmed(true);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        form.setValue("startLat", lat);
        form.setValue("startLng", lng);
        form.setValue("startLocation", `${lat}, ${lng}`);
        setLocationConfirmed(true);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 10000 }
    );
  };

  const maxDist = form.watch("maxDistanceKm");
  const qty = form.watch("quantityQuintals");

  return (
    <Card className="border-card-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Route className="w-5 h-5 text-primary" />
          {t.form.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="startLocation"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {t.form.startLocation}
                      {locationConfirmed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-1" />
                      )}
                    </FormLabel>
                    <div className="relative" ref={dropdownRef}>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              placeholder={t.form.startLocationPlaceholder}
                              data-testid="input-start-location"
                              className="pl-9"
                              {...field}
                              onChange={(e) => handleLocationInput(e.target.value, field.onChange)}
                              onFocus={() => {
                                if (field.value.length >= 2) searchLocation(field.value);
                              }}
                            />
                          </FormControl>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleGeolocate}
                          disabled={geoLoading}
                          data-testid="button-geolocate"
                          title="Use my current location"
                        >
                          {geoLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LocateFixed className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {showDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto" data-testid="location-dropdown">
                          {searching ? (
                            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t.form.searching}
                            </div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((result, i) => (
                              <button
                                key={i}
                                type="button"
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors flex items-start gap-2 border-b last:border-0 border-border/50"
                                onClick={() => selectLocation(
                                  result.display_name.split(",").slice(0, 2).join(",").trim(),
                                  parseFloat(result.lat),
                                  parseFloat(result.lon)
                                )}
                                data-testid={`location-result-${i}`}
                              >
                                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{result.display_name}</span>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-sm text-muted-foreground">
                              {t.form.noResults}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs text-muted-foreground mr-1">{t.form.popularCities}:</span>
                      {POPULAR_CITIES.map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          className={`text-xs px-2 py-0.5 rounded-full border transition-all hover:scale-105 ${
                            form.getValues("startLocation") === city.name
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                          onClick={() => selectLocation(city.name, city.lat, city.lng)}
                          data-testid={`city-${city.name.toLowerCase()}`}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>

                    {!locationConfirmed && field.value.length > 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        {t.form.typeToSearch}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Wheat className="w-3.5 h-3.5 text-primary" />
                      {t.form.cropType}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-crop-type">
                          <SelectValue placeholder={t.form.selectCrop} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {t.crops[crop as keyof typeof t.crops]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelCostPerKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                      {t.form.fuelCost}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="1"
                        max="50"
                        data-testid="input-fuel-cost"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantityQuintals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-primary" />
                        {t.form.quantity}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">{qty} {t.form.quintals}</span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(v) => field.onChange(v[0])}
                        data-testid="slider-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxDistanceKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5 text-primary" />
                        {t.form.maxDistance}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">{maxDist} {t.form.km}</span>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={10}
                        max={300}
                        step={5}
                        value={[field.value]}
                        onValueChange={(v) => field.onChange(v[0])}
                        data-testid="slider-max-distance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-form-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
              data-testid="button-find-routes"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.form.findingRoutes}
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  {t.form.findRoutes}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
