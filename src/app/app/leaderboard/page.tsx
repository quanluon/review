"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  level: number;
  total_reviews: number;
  total_followers: number;
  badges: string[];
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        const result = await response.json();
        setLeaderboard(result.data || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getLevelBadge = (level: number) => {
    if (level >= 10) return "🏆 Master";
    if (level >= 5) return "⭐ Expert";
    if (level >= 3) return "🌟 Pro";
    return "🌱 Beginner";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Leaderboard
        </h1>
        <p className="text-gray-600 mt-1">Top reviewers of the month</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading leaderboard...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No reviewers yet</p>
          <p className="text-sm">Be the first to write a review!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <Card
              key={entry.id}
              className={index < 3 ? "border-2 border-yellow-400 bg-yellow-50/50" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    #{index + 1}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{entry.name}</span>
                      <Badge variant="outline">{getLevelBadge(entry.level)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{entry.total_reviews} reviews</span>
                      <span>{entry.total_followers} followers</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {entry.points}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span>Write a review: <strong>+10 points</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span>Get a follower: <strong>+5 points</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <span>Add a place: <strong>+20 points</strong> (coming soon)</span>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="font-semibold">Levels:</p>
            <p>🌱 Beginner: 0-99 points</p>
            <p>🌟 Pro: 100-499 points</p>
            <p>⭐ Expert: 500-999 points</p>
            <p>🏆 Master: 1000+ points</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

