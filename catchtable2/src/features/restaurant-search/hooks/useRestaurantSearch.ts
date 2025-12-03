import { useState, useMemo } from "react";
import { mockRestaurants, type Restaurant } from "../data/mockRestaurants";

export type SearchFilters = {
  location: string;
  menu: string;
  priceRange: string;
  cuisine: string;
};

export function useRestaurantSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    menu: "",
    priceRange: "",
    cuisine: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredRestaurants = useMemo(() => {
    let results = [...mockRestaurants];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.location.toLowerCase().includes(query) ||
          restaurant.menu.some((m) => m.toLowerCase().includes(query)),
      );
    }

    if (filters.location) {
      results = results.filter((restaurant) =>
        restaurant.location.includes(filters.location),
      );
    }

    if (filters.menu) {
      results = results.filter((restaurant) =>
        restaurant.menu.some((m) => m.includes(filters.menu)),
      );
    }

    if (filters.priceRange) {
      results = results.filter(
        (restaurant) => restaurant.priceRange === filters.priceRange,
      );
    }

    return results;
  }, [searchQuery, filters]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      menu: "",
      priceRange: "",
      cuisine: "",
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    resetFilters,
    isFilterOpen,
    setIsFilterOpen,
    filteredRestaurants,
  };
}

