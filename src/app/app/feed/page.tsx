"use client";

import { useReviews } from "@/hooks/use-reviews";
import { useRealtimeReviews } from "@/hooks/use-realtime-reviews";
import { ReviewCard } from "@/components/reviews/review-card";
import { Badge } from "@/components/ui/badge";

export default function FeedPage() {
  const { reviews: initialReviews, loading, error } = useReviews({
    limit: 50,
  });

  // Enable realtime updates
  const { reviews, isConnected } = useRealtimeReviews({
    initialReviews,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Latest Reviews
        </h1>
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

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading reviews...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No reviews yet</p>
          <p className="text-sm">Be the first to write a review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

