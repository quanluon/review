"use client";

import { useState } from "react";
import { usePlaces } from "@/hooks/use-places";
import { PlaceCard } from "@/components/places/place-card";
import { CreatePlaceDialog } from "@/components/places/create-place-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PLACE_TYPES = ["all", "restaurant", "cafe", "bar", "shop", "hotel"];

export default function PlacesPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { places, loading, error } = usePlaces({
    limit: 50,
    orderBy: "avg_rating",
    type: selectedType !== "all" ? selectedType : undefined,
    search: searchQuery || undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Places
        </h1>
        <CreatePlaceDialog />
      </div>

      {/* Search */}
      <div>
        <Input
          type="search"
          placeholder="Search places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
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
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}

