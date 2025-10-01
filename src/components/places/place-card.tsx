"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/supabase";

type Place = Database["public"]["Tables"]["places"]["Row"];

interface PlaceCardProps {
  place: Place;
  distance?: number;
}

export function PlaceCard({ place, distance }: PlaceCardProps) {
  const renderStars = (rating: number) => {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  return (
    <Link href={`/app/places/${place.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-lg line-clamp-2" 
                title={place.name}
              >
                {place.name}
              </CardTitle>
              {place.address && (
                <CardDescription 
                  className="text-sm line-clamp-2 mt-1"
                  title={place.address}
                >
                  {place.address}
                </CardDescription>
              )}
            </div>
            {place.type && (
              <Badge variant="outline" className="shrink-0 capitalize">
                {place.type}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-base">
                {renderStars(place.avg_rating)}
              </span>
              <span className="font-semibold">{place.avg_rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500">
              {place.review_count} {place.review_count === 1 ? "review" : "reviews"}
            </span>
            {distance !== undefined && (
              <span className="text-blue-600 font-medium">
                📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

