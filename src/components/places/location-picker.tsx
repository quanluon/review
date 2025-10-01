"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useGeolocation, type Coordinates } from "@/hooks/use-geolocation";

interface LocationPickerProps {
  onLocationChange: (location: Coordinates | null) => void;
  initialLocation?: Coordinates | null;
}

export function LocationPicker({
  onLocationChange,
  initialLocation,
}: LocationPickerProps) {
  const { location: currentLocation, loading, error, requestLocation } = useGeolocation();
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    initialLocation || null
  );
  const [manualMode, setManualMode] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
      onLocationChange(currentLocation);
    }
  }, [currentLocation, onLocationChange]);

  const handleUseCurrentLocation = () => {
    requestLocation();
  };

  const handleManualInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      const coords = { latitude: lat, longitude: lng };
      setSelectedLocation(coords);
      onLocationChange(coords);
      setManualMode(false);
    }
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    onLocationChange(null);
    setManualLat("");
    setManualLng("");
    setMapUrl("");
    setUrlError("");
  };

  const extractLocationFromUrl = (url: string): Coordinates | null => {
    setUrlError("");

    try {
      // Google Maps patterns:
      // https://www.google.com/maps?q=10.762622,106.660172
      // https://www.google.com/maps/@10.762622,106.660172,15z
      // https://maps.google.com/?q=10.762622,106.660172
      // https://goo.gl/maps/... (shortened)
      
      // OpenStreetMap pattern:
      // https://www.openstreetmap.org/#map=15/10.762622/106.660172
      
      // Apple Maps pattern:
      // https://maps.apple.com/?ll=10.762622,106.660172

      // Pattern 1: Google Maps @lat,lng or ?q=lat,lng
      let match = url.match(/[@?q=](-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }

      // Pattern 2: OpenStreetMap #map=zoom/lat/lng
      match = url.match(/#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }

      // Pattern 3: Apple Maps ll=lat,lng
      match = url.match(/ll=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }

      // Pattern 4: Plain lat,lng in URL
      match = url.match(/(-?\d+\.?\d{4,}),\s*(-?\d+\.?\d{4,})/);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }

      setUrlError("Could not extract location from URL. Try Google Maps, OpenStreetMap, or Apple Maps links.");
      return null;
    } catch (err) {
      setUrlError("Invalid URL format");
      return null;
    }
  };

  const handleUrlInput = () => {
    const coords = extractLocationFromUrl(mapUrl);
    if (coords) {
      setSelectedLocation(coords);
      onLocationChange(coords);
      setUrlMode(false);
      setMapUrl("");
    }
  };

  return (
    <div className="space-y-3">
      <Label>Location (Optional)</Label>

      {!selectedLocation && !manualMode && !urlMode && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Getting location..." : "📍 Use Current Location"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUrlMode(true)}
              className="flex-1"
            >
              🗺️ Paste Map URL
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setManualMode(true)}
            >
              Enter Coordinates
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {urlMode && !selectedLocation && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="Paste Google Maps, OpenStreetMap, or Apple Maps URL"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              className="text-sm"
            />
            {urlError && (
              <p className="text-xs text-red-600">{urlError}</p>
            )}
            <p className="text-xs text-gray-500">
              Examples: Google Maps share link, OpenStreetMap URL, or Apple Maps link
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlInput}
              size="sm"
              disabled={!mapUrl}
            >
              Extract Location
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setUrlMode(false);
                setMapUrl("");
                setUrlError("");
              }}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {manualMode && !selectedLocation && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="any"
              placeholder="Latitude"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleManualInput}
              size="sm"
            >
              Set Location
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setManualMode(false)}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm">
              <div className="font-medium text-blue-900">Location Set</div>
              <div className="text-blue-700 text-xs mt-1">
                📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearLocation}
              className="text-blue-700 hover:text-blue-900"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

