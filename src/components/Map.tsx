import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  className?: string;
}

const Map: React.FC<MapProps> = ({ className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // You'll need to add your Mapbox public token to Supabase Edge Function Secrets
    // For now, using a placeholder - replace with actual token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'your-mapbox-token-here';
    
    // Coordinates for Atarot Industrial Area, Jerusalem
    const coordinates: [number, number] = [35.2137, 31.8000]; // Jerusalem, Atarot area

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 15,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add a marker for MT Wraps location
    const marker = new mapboxgl.Marker({
      color: '#3B82F6', // Primary blue color
      scale: 1.2,
    })
      .setLngLat(coordinates)
      .addTo(map.current);

    // Add a popup to the marker
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
    }).setHTML(`
      <div class="p-2">
        <h3 class="font-bold text-sm mb-1">MT Wraps</h3>
        <p class="text-xs text-gray-600">Atarot Industrial Area</p>
        <p class="text-xs text-gray-600">Hatamrukim, Jerusalem</p>
        <p class="text-xs text-blue-600 mt-1">052-5701-073</p>
      </div>
    `);

    marker.setPopup(popup);

    // Show popup by default
    marker.togglePopup();

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 bg-muted/90 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-sm font-medium mb-2">Interactive Map</p>
            <p className="text-xs text-muted-foreground">
              Mapbox token required to display map
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;