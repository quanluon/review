"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  userId: string;
  userName?: string;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!isAuthenticated || !user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}/follow`);
        const result = await response.json();
        setIsFollowing(result.isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [userId, isAuthenticated, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.id === userId) {
    return null; // Don't show follow button for self
  }

  if (checkingStatus) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={loading}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </Button>
  );
}

