"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/users/follow-button";
import { ImageLightbox } from "@/components/reviews/image-lightbox";
import { useAuth } from "@/hooks/use-auth";
import type { ReviewWithRelations } from "@/lib/db/reviews";

interface ReviewCardProps {
  review: ReviewWithRelations;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { isAuthenticated } = useAuth();
  
  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user.avatar_url || undefined} />
            <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm line-clamp-1" title={review.user.name}>
                  {review.user.name}
                </span>
                {isAuthenticated && (
                  <FollowButton userId={review.user.id} userName={review.user.name} />
                )}
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-gray-400">·</span>
                <Link
                  href={`/app/places/${review.place.id}`}
                  className="text-sm text-blue-600 hover:underline line-clamp-1 flex-1"
                  title={review.place.name}
                >
                  {review.place.name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500 text-sm">
                {renderStars(review.rating)}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      {(review.text || (review.review_images && review.review_images.length > 0)) && (
        <CardContent className="pt-0">
          {review.text && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {review.text}
            </p>
          )}
          {review.review_images && review.review_images.length > 0 && (
            <ImageLightbox images={review.review_images} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

