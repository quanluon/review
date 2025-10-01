"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Database } from "@/types/supabase";

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

type Place = Database["public"]["Tables"]["places"]["Row"];

interface PlaceMapProps {
  places: Place[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export function PlaceMap({
  places,
  center = [10.8231, 106.6297], // Default: Ho Chi Minh City
  zoom = 13,
  height = "400px",
}: PlaceMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const placesWithLocation = places.filter((p) => p.lat && p.lng);

  if (placesWithLocation.length === 0) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500">No places with location data</p>
      </div>
    );
  }

  // Calculate center from places if not provided
  const mapCenter =
    center ||
    (placesWithLocation.length > 0
      ? [
          placesWithLocation[0].lat!,
          placesWithLocation[0].lng!,
        ]
      : [10.8231, 106.6297]) as [number, number];

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {placesWithLocation.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat!, place.lng!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{place.name}</h3>
                {place.address && (
                  <p className="text-sm text-gray-600">{place.address}</p>
                )}
                <div className="mt-2">
                  <span className="text-yellow-500">
                    {"★".repeat(Math.round(place.avg_rating))}
                  </span>
                  <span className="text-sm ml-2">
                    {place.avg_rating.toFixed(1)} ({place.review_count} reviews)
                  </span>
                </div>
                <a
                  href={`/app/places/${place.id}`}
                  className="text-blue-600 hover:underline text-sm mt-2 block"
                >
                  View details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

