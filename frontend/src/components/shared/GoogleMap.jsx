import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Loader, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch (e) {
  console.warn('Failed to configure Leaflet icons:', e);
}

const officeLocation = {
  lat: 5.3367,
  lng: -0.2061,
  name: 'ResolveHub Office',
  address: 'Korle Bu, Accra, Ghana',
  phone: '+233 (059) 434 5424',
  email: 'support@resolvehub.com',
};

// Custom icons
const createCustomIcon = (color) => {
  return L.divIcon({
    html: `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${color}; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 20px; color: white;">
             ${color === '#7c3aed' ? '🏢' : '📍'}
           </div>`,
    iconSize: [40, 40],
  });
};

const officeIcon = createCustomIcon('#7c3aed');
const userIcon = createCustomIcon('#3b82f6');

export default function GoogleMapComponent() {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(officeLocation);
  const mapRef = useRef(null);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setMapCenter(newLocation);
        setIsLoadingLocation(false);
      },
      (err) => {
        console.log('Geolocation error:', err);
        setIsLoadingLocation(false);
        setMapCenter(officeLocation);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  }, []);

  // Watch user's location in real-time
  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(newLocation);

            // Pan map to user's new location
            if (mapRef.current) {
              mapRef.current.setView([newLocation.lat, newLocation.lng], 15, {
                animate: true,
                duration: 1,
              });
            }
          },
          (err) => {
            console.log('Watch position error:', err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 2000,
            timeout: 20000,
          }
        );
      } catch (err) {
        console.warn('Failed to watch position:', err);
      }
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoadingLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading map and your location...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={15}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Office Location Marker */}
      <Marker position={[officeLocation.lat, officeLocation.lng]} icon={officeIcon}>
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-sm">{officeLocation.name}</h3>
            <p className="text-xs text-gray-600">{officeLocation.address}</p>
            <p className="text-xs text-gray-500 mt-1">📞 {officeLocation.phone}</p>
            <p className="text-xs text-gray-500">📧 {officeLocation.email}</p>
          </div>
        </Popup>
      </Marker>

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm">Your Location</h3>
              <p className="text-xs text-gray-600">Lat: {userLocation.lat.toFixed(4)}</p>
              <p className="text-xs text-gray-600">Lng: {userLocation.lng.toFixed(4)}</p>
              <p className="text-xs text-blue-500 mt-1">📍 Real-time tracking active</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
