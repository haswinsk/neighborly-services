import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Locate, MapPin, Star, Navigation } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  service: string;
  category: string;
  latitude: number;
  longitude: number;
  rating: number;
  price: number;
  availability: string;
  distance?: number;
}

interface MapBoxProps {
  onProviderSelect?: (provider: Provider) => void;
  providers?: Provider[];
}

export const MapBox = ({ onProviderSelect, providers = [] }: MapBoxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not found. Set VITE_MAPBOX_TOKEN in your environment variables.');
      setLoading(false);
      return;
    }

    mapboxgl.accessToken = token;

    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 13,
        center: [-74.5, 40],
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setLoading(false);
        requestUserLocation();
      });
    }

    return () => {
      // Cleanup handled on unmount
    };
  }, []);

  // Request user geolocation
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000,
          });

          // Add user location marker
          new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML('<p class="text-sm font-semibold">Your Location</p>'))
            .addTo(map.current);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Default to New York if permission denied
        if (map.current) {
          map.current.flyTo({
            center: [-74.006, 40.7128],
            zoom: 13,
            duration: 1000,
          });
        }
      }
    );
  };

  // Add provider markers
  useEffect(() => {
    if (!map.current || providers.length === 0) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    providers.forEach((provider) => {
      if (!provider.latitude || !provider.longitude) return;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 rounded-lg max-w-xs">
          <h3 class="font-semibold text-sm">${provider.name}</h3>
          <p class="text-xs text-gray-600">${provider.service}</p>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-xs font-semibold">★ ${provider.rating.toFixed(1)}</span>
            <span class="text-xs text-gray-500">₹${provider.price}</span>
          </div>
          ${provider.distance ? `<p class="text-xs text-gray-500 mt-1">${provider.distance.toFixed(1)} km away</p>` : ''}
          <button onclick="window.dispatchEvent(new CustomEvent('provider-selected', { detail: ${JSON.stringify(provider)} }))" class="mt-2 w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700">
            Book Now
          </button>
        </div>
      `);

      const marker = new mapboxgl.Marker({ color: getCategoryColor(provider.category) })
        .setLngLat([provider.longitude, provider.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [providers]);

  // Handle provider selection from popup
  useEffect(() => {
    const handleProviderSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (onProviderSelect) {
        onProviderSelect(customEvent.detail);
      }
    };

    window.addEventListener('provider-selected', handleProviderSelected);
    return () => window.removeEventListener('provider-selected', handleProviderSelected);
  }, [onProviderSelect]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Plumbing': '#ef4444',
      'Electrical': '#eab308',
      'Cleaning': '#06b6d4',
      'Carpentry': '#8b5cf6',
      'Painting': '#ec4899',
      'HVAC': '#0ea5e9',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <p className="text-sm font-semibold">Loading map...</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <Button
          onClick={requestUserLocation}
          size="sm"
          className="rounded-lg gap-2 shadow-lg"
          variant="default"
        >
          <Locate className="h-4 w-4" />
          Locate Me
        </Button>
      </div>

      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h3 className="font-semibold text-sm mb-2">Nearby Providers</h3>
        <p className="text-xs text-gray-600">
          {providers.length} service provider{providers.length !== 1 ? 's' : ''} available
          {userLocation && providers.some((p) => p.distance) && ' near you'}
        </p>
      </div>
    </div>
  );
};
