import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { routeRequestSchema, cropTypes, cropLabels, type RouteRequest } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Wheat, Package, Route, Fuel, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface RouteFormProps {
  onSubmit: (data: RouteRequest) => void;
  isLoading: boolean;
  error?: string;
}

export function RouteForm({ onSubmit, isLoading, error }: RouteFormProps) {
  const [geoLoading, setGeoLoading] = useState(false);

  const form = useForm<RouteRequest>({
    resolver: zodResolver(routeRequestSchema),
    defaultValues: {
      startLat: 13.0827,
      startLng: 80.2707,
      startLocation: "Chennai, Tamil Nadu",
      cropType: "tomato",
      quantityQuintals: 10,
      maxDistanceKm: 150,
      fuelCostPerKm: 12,
    },
  });

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("startLat", parseFloat(pos.coords.latitude.toFixed(4)));
        form.setValue("startLng", parseFloat(pos.coords.longitude.toFixed(4)));
        form.setValue("startLocation", `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 10000 }
    );
  };

  const maxDist = form.watch("maxDistanceKm");
  const qty = form.watch("quantityQuintals");

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Route className="w-5 h-5 text-primary" />
          Find Best Mandi Routes
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
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      Starting Location
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter your village or city name"
                          data-testid="input-start-location"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGeolocate}
                        disabled={geoLoading}
                        data-testid="button-geolocate"
                      >
                        {geoLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LocateFixed className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
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
                      Crop Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-crop-type">
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {cropLabels[crop]}
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
                name="quantityQuintals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-primary" />
                        Quantity
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">{qty} quintals</span>
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
                        Max Travel Distance
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">{maxDist} km</span>
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

              <FormField
                control={form.control}
                name="fuelCostPerKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-primary" />
                      Fuel Cost (Rs/km)
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

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startLat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          data-testid="input-lat"
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
                  name="startLng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          data-testid="input-lng"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              className="w-full"
              disabled={isLoading}
              data-testid="button-find-routes"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Best Routes...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Best Routes
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
