"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePlaces } from "@/hooks/use-places";
import { useAuth } from "@/hooks/use-auth";
import { useGeolocation, calculateDistance } from "@/hooks/use-geolocation";
import { PlaceCard } from "@/components/places/place-card";
import { CreatePlaceDialog } from "@/components/places/create-place-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLACE_TYPES = ["all", "restaurant", "cafe", "bar", "shop", "hotel"];

export default function PlacesPage() {
  const { isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchInput, setSearchInput] = useState(""); // User input
  const [searchQuery, setSearchQuery] = useState(""); // Debounced value
  const [sortByDistance, setSortByDistance] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { location, requestLocation, loading: locationLoading } = useGeolocation();

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { places, loading, error } = usePlaces({
    limit: 50,
    orderBy: sortByDistance ? undefined : "avg_rating",
    type: selectedType !== "all" ? selectedType : undefined,
    search: searchQuery || undefined,
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    window.location.reload();
  };

  // Sort places by distance if location is available
  const sortedPlaces = useMemo(() => {
    if (!sortByDistance || !location || !places) return places;

    return [...places]
      .filter((p) => p.lat && p.lng)
      .map((place) => ({
        ...place,
        distance: calculateDistance(location, {
          latitude: place.lat!,
          longitude: place.lng!,
        }),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [places, location, sortByDistance]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Places
        </h1>
        {isAuthenticated ? (
          <CreatePlaceDialog onSuccess={handleRefresh} />
        ) : (
          <Link href="/login">
            <Button className="w-full sm:w-auto">
              Sign in to Add Place
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Input
          type="search"
          placeholder="Search places..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full"
        />
        {searchInput !== searchQuery && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Searching...
            </div>
          </div>
        )}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {PLACE_TYPES.map((type) => (
          <Badge
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            className="cursor-pointer capitalize shrink-0"
            onClick={() => setSelectedType(type)}
          >
            {type}
          </Badge>
        ))}
      </div>

      {/* Location filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={sortByDistance ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (!location) {
              requestLocation();
            }
            setSortByDistance(!sortByDistance);
          }}
          disabled={locationLoading}
        >
          {locationLoading
            ? "Getting location..."
            : sortByDistance
            ? "📍 Sorted by distance"
            : "📍 Sort by distance"}
        </Button>
        {sortByDistance && location && (
          <span className="text-sm text-gray-600 self-center">
            Showing places near you
          </span>
        )}
      </div>

      {/* Places grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading places...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : places.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No places found</p>
          <p className="text-sm">
            {searchQuery
              ? "Try adjusting your search"
              : "Be the first to add a place!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlaces.map((place) => (
            <PlaceCard 
              key={place.id} 
              place={place}
              distance={'distance' in place ? (place as typeof place & { distance: number }).distance : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

