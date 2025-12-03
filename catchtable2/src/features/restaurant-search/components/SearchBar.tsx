"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SearchFilters } from "../hooks/useRestaurantSearch";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string) => void;
  onResetFilters: () => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
};

const locations = ["강남구", "서초구", "홍대", "명동", "압구정", "청담동", "종로구", "이태원"];
const cuisines = ["한식", "양식", "일식", "중식", "이탈리안", "프랑스식", "멕시칸", "태국식"];
const priceRanges = ["1만원대", "2만원대", "3만원대", "4만원대", "5만원대", "6만원대"];

export function SearchBar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
  isFilterOpen,
  onToggleFilter,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="지역, 식당명, 메뉴로 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="button" onClick={onToggleFilter} variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      {isFilterOpen && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">상세 필터</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleFilter}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="location">지역</Label>
              <Select
                value={filters.location}
                onValueChange={(value) => onFilterChange("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">요리 종류</Label>
              <Select
                value={filters.cuisine}
                onValueChange={(value) => onFilterChange("cuisine", value)}
              >
                <SelectTrigger id="cuisine">
                  <SelectValue placeholder="요리 종류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu">메뉴</Label>
              <Input
                id="menu"
                type="text"
                placeholder="메뉴명 입력"
                value={filters.menu}
                onChange={(e) => onFilterChange("menu", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceRange">가격 범위</Label>
              <Select
                value={filters.priceRange}
                onValueChange={(value) => onFilterChange("priceRange", value)}
              >
                <SelectTrigger id="priceRange">
                  <SelectValue placeholder="가격 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
              필터 초기화
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

