import { useEffect, useRef } from "react";
import { type RouteRecommendation, type Mandi } from "@shared/schema";

interface RouteMapProps {
  routes: RouteRecommendation[];
  selectedRoute: number;
  onSelectRoute: (index: number) => void;
  startLat: number;
  startLng: number;
  nearbyMandis: Mandi[];
}

export function RouteMap({ routes, selectedRoute, onSelectRoute, startLat, startLng, nearbyMandis }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMap = async () => {
      const L = await import("leaflet");

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current!, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([startLat, startLng], 9);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];

      const startIcon = L.divIcon({
        html: `<div style="background:#16a34a;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: "",
      });

      const startMarker = L.marker([startLat, startLng], { icon: startIcon })
        .addTo(map)
        .bindPopup("<strong>Your Location</strong>");
      layersRef.current.push(startMarker);

      nearbyMandis.forEach((mandi) => {
        const isInRoute = routes[selectedRoute]?.stops.some(
          (s) => s.mandi.id === mandi.id
        );

        const mandiIcon = L.divIcon({
          html: `<div style="background:${isInRoute ? "#f59e0b" : "#94a3b8"};width:${isInRoute ? "12px" : "8px"};height:${isInRoute ? "12px" : "8px"};border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>`,
          iconSize: [isInRoute ? 12 : 8, isInRoute ? 12 : 8],
          iconAnchor: [isInRoute ? 6 : 4, isInRoute ? 6 : 4],
          className: "",
        });

        const marker = L.marker([mandi.lat, mandi.lng], { icon: mandiIcon })
          .addTo(map)
          .bindPopup(`<strong>${mandi.name}</strong><br/>${mandi.district}, ${mandi.state}`);
        layersRef.current.push(marker);
      });

      const routeColors = ["#16a34a", "#3b82f6", "#f59e0b"];
      routes.forEach((route, rIndex) => {
        const points: [number, number][] = [[startLat, startLng]];
        route.stops.forEach((stop) => {
          points.push([stop.mandi.lat, stop.mandi.lng]);
        });

        const isActive = rIndex === selectedRoute;
        const polyline = L.polyline(points, {
          color: routeColors[rIndex] || "#94a3b8",
          weight: isActive ? 4 : 2,
          opacity: isActive ? 0.9 : 0.3,
          dashArray: isActive ? undefined : "8 4",
        }).addTo(map);

        polyline.on("click", () => onSelectRoute(rIndex));
        layersRef.current.push(polyline);
      });

      const allPoints: [number, number][] = [[startLat, startLng]];
      nearbyMandis.forEach((m) => allPoints.push([m.lat, m.lng]));
      if (allPoints.length > 1) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
      }
    };

    loadMap();
  }, [routes, selectedRoute, startLat, startLng, nearbyMandis]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className="w-full h-[400px] md:h-[500px] rounded-md z-0"
        data-testid="map-container"
      />
      <div className="absolute bottom-3 left-3 z-[1000] flex gap-1.5">
        {routes.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelectRoute(i)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
              selectedRoute === i
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/90 text-foreground border-border backdrop-blur-sm"
            }`}
            data-testid={`button-map-route-${i}`}
          >
            Route #{i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
