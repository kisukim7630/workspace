"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useRestaurantSearch } from "@/features/restaurant-search/hooks/useRestaurantSearch";
import { SearchBar } from "@/features/restaurant-search/components/SearchBar";
import { ResultsList } from "@/features/restaurant-search/components/ResultsList";
import { useRestaurants } from "@/features/restaurants/hooks/useRestaurants";
import { useMemo } from "react";

export default function SearchPage() {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    resetFilters,
    isFilterOpen,
    setIsFilterOpen,
  } = useRestaurantSearch();

  const apiFilters = useMemo(
    () => ({
      search: searchQuery || undefined,
      location: filters.location || undefined,
      cuisine: filters.cuisine || undefined,
      priceRange: filters.priceRange || undefined,
      menu: filters.menu || undefined,
    }),
    [searchQuery, filters],
  );

  const { data, isLoading, error } = useRestaurants(apiFilters);

  const restaurants = useMemo(() => {
    if (!data) return [];
    const mapped = data.restaurants.map((restaurant) => {
      // 디버깅: ID가 제대로 전달되는지 확인
      if (typeof window !== "undefined" && restaurant.id) {
        console.log("Restaurant ID:", restaurant.id, "Type:", typeof restaurant.id);
      }
      return {
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.imageUrl || "https://picsum.photos/400/300?random=1",
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        location: restaurant.location,
        cuisine: restaurant.cuisine,
        priceRange: restaurant.priceRange,
        distance: restaurant.distanceKm || 0,
      };
    });
    return mapped;
  }, [data]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-background py-8">
          <div className="container px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6">
                <h1 className="mb-2 text-3xl font-bold">식당 검색</h1>
                <p className="text-muted-foreground">원하는 식당을 찾아보세요</p>
              </div>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onFilterChange={updateFilter}
                onResetFilters={resetFilters}
                isFilterOpen={isFilterOpen}
                onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4">
            {isLoading && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">로딩 중...</p>
              </div>
            )}
            {error && (
              <div className="py-12 text-center">
                <p className="text-destructive">오류가 발생했습니다: {error.message}</p>
              </div>
            )}
            {!isLoading && !error && <ResultsList restaurants={restaurants} />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
