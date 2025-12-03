"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RestaurantListItem = {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  cuisine: string;
  priceRange: string;
  distance: number;
};

type ResultsListProps = {
  restaurants: RestaurantListItem[];
};

export function ResultsList({ restaurants }: ResultsListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          다른 검색어나 필터를 시도해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        총 {restaurants.length}개의 식당을 찾았습니다
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => {
          // 디버깅: 검색 결과에서 ID 확인
          console.log("ResultsList - Restaurant:", {
            id: restaurant.id,
            name: restaurant.name,
            idType: typeof restaurant.id,
            idLength: restaurant.id?.length,
          });
          
          return (
            <Card key={restaurant.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative h-48 w-full">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {restaurant.location} · {restaurant.distance}km
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({restaurant.reviewCount})
                    </span>
                  </div>
                  <Badge variant="secondary">{restaurant.cuisine}</Badge>
                </div>
                <div className="mb-4 text-sm text-muted-foreground">
                  {restaurant.priceRange}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  asChild
                  onClick={() => {
                    console.log("Button clicked - Restaurant ID:", restaurant.id, "Link will be:", `/restaurant/${restaurant.id}`);
                  }}
                >
                  <Link href={`/restaurant/${restaurant.id}`}>상세보기</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

