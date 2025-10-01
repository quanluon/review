"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreateReviewDialog } from "@/components/reviews/create-review-dialog";
import { ReviewCard } from "@/components/reviews/review-card";
import { useReviews } from "@/hooks/use-reviews";
import { useRealtimeReviews } from "@/hooks/use-realtime-reviews";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/types/supabase";

type Place = Database["public"]["Tables"]["places"]["Row"];

export default function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  const { reviews: initialReviews, refresh } = useReviews({
    placeId: resolvedParams.id,
    limit: 50,
  });

  // Enable realtime updates for this place
  const { reviews, isConnected } = useRealtimeReviews({
    placeId: resolvedParams.id,
    initialReviews,
  });

  const fetchPlace = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/places/${resolvedParams.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch place");
      }

      setPlace(result.data);
    } catch (error) {
      console.error("Error fetching place:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlace();
  }, [resolvedParams.id]);

  const renderStars = (rating: number) => {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12 text-red-600">Place not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Place header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <CardTitle 
                  className="text-2xl sm:text-3xl break-words"
                  title={place.name}
                >
                  {place.name}
                </CardTitle>
                {place.type && (
                  <Badge variant="outline" className="capitalize shrink-0">
                    {place.type}
                  </Badge>
                )}
              </div>
              {place.address && (
                <p className="text-gray-600 break-words" title={place.address}>
                  {place.address}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-2xl">
                {renderStars(place.avg_rating)}
              </span>
              <span className="text-2xl font-bold">
                {place.avg_rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              {place.review_count}{" "}
              {place.review_count === 1 ? "review" : "reviews"}
            </span>
          </div>
          
          {isAuthenticated ? (
            <CreateReviewDialog
              placeId={place.id}
              placeName={place.name}
              onSuccess={() => {
                refresh();
                fetchPlace(); // Refresh place data (updated rating)
              }}
            />
          ) : (
            <Link href="/login">
              <Button className="w-full sm:w-auto">
                Sign in to Write Review
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Reviews</h2>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${isConnected ? 'text-green-700' : 'text-gray-500'}`}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            {isConnected ? 'Live' : 'Connecting...'}
          </Badge>
        </div>
        <Separator />
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No reviews yet</p>
            <p className="text-sm">Be the first to review this place!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

