"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/features/products/components/product-card";
import {
  mockProducts,
  categories,
  locations,
} from "@/features/products/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortOption = "latest" | "popular" | "price-low" | "price-high";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    searchParams.get("location") || null
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "latest"
  );

  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedLocation) {
      filtered = filtered.filter((p) => p.location === selectedLocation);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popular":
          return Math.random() - 0.5;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, selectedCategory, selectedLocation, sortBy]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedLocation) params.set("location", selectedLocation);
    if (sortBy !== "latest") params.set("sort", sortBy);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedLocation(null);
    setSortBy("latest");
    router.push("/search");
  };

  const hasActiveFilters =
    searchQuery.trim() || selectedCategory || selectedLocation || sortBy !== "latest";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">상품 검색</h1>
            <p className="text-muted-foreground">
              키워드, 카테고리, 지역으로 상품을 찾아보세요
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>필터</CardTitle>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-auto p-0 text-xs"
                      >
                        <X className="mr-1 h-3 w-3" />
                        초기화
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        name="query"
                        type="search"
                        placeholder="키워드 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        카테고리
                      </label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant={selectedCategory === null ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(null)}
                        >
                          전체
                        </Button>
                        {categories.map((category) => (
                          <Button
                            key={category}
                            type="button"
                            variant={
                              selectedCategory === category ? "default" : "outline"
                            }
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        지역
                      </label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant={selectedLocation === null ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedLocation(null)}
                        >
                          전체
                        </Button>
                        {locations.map((location) => (
                          <Button
                            key={location}
                            type="button"
                            variant={
                              selectedLocation === location ? "default" : "outline"
                            }
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setSelectedLocation(location)}
                          >
                            {location}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        정렬
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="latest">최신순</option>
                        <option value="popular">인기순</option>
                        <option value="price-low">가격 낮은순</option>
                        <option value="price-high">가격 높은순</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full">
                      검색
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </aside>

            <div className="lg:col-span-3">
              {hasActiveFilters && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {searchQuery.trim() && (
                    <Badge variant="secondary" className="gap-1">
                      검색: {searchQuery}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      카테고리: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedLocation && (
                    <Badge variant="secondary" className="gap-1">
                      지역: {selectedLocation}
                      <button
                        onClick={() => setSelectedLocation(null)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              <div className="mb-4 text-sm text-muted-foreground">
                총 {filteredProducts.length}개의 상품이 검색되었습니다.
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="mb-2 text-lg font-medium">검색 결과가 없습니다</p>
                  <p className="text-muted-foreground">
                    다른 키워드나 필터로 검색해보세요
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

