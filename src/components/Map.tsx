import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  className?: string;
}

const Map: React.FC<MapProps> = ({ className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Mapbox token will be retrieved from Supabase secrets
    // For now, we'll show a placeholder until the token is configured
    const mapboxToken = 'pk.your_mapbox_token_here'; // This will be replaced with actual token
    
    if (mapboxToken === 'pk.your_mapbox_token_here') {
      // Show fallback when no token is configured
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
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
      <div className="absolute inset-0 bg-muted/90 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">MT Wraps Location</h3>
          <p className="text-muted-foreground mb-2">Atarot Industrial Area, Jerusalem</p>
          <p className="text-xs text-muted-foreground">
            Configure Mapbox token to display interactive map
          </p>
        </div>
      </div>
    </div>
  );
};

export default Map;