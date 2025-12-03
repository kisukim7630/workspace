"use client";

import Link from "next/link";
import { Search, Calendar, Clock, Star } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const featuredRestaurants = [
  {
    id: "1",
    name: "맛있는 식당",
    image: "https://picsum.photos/400/300?random=1",
    rating: 4.5,
    location: "강남구",
    cuisine: "한식",
  },
  {
    id: "2",
    name: "고급 레스토랑",
    image: "https://picsum.photos/400/300?random=2",
    rating: 4.8,
    location: "서초구",
    cuisine: "양식",
  },
  {
    id: "3",
    name: "일본식당",
    image: "https://picsum.photos/400/300?random=3",
    rating: 4.6,
    location: "홍대",
    cuisine: "일식",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                맛집 예약, 이제 더 쉽게
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                원하는 식당을 검색하고 간편하게 예약하세요
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="지역, 식당명, 메뉴로 검색..."
                    className="pl-10 h-12"
                  />
                </div>
                <Button size="lg" className="h-12 px-8">
                  검색
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container px-4">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold">인기 식당</h2>
              <p className="text-muted-foreground">지금 가장 인기 있는 식당들을 만나보세요</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>
                      {restaurant.location} · {restaurant.cuisine}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/restaurant/${restaurant.id}`}>상세보기</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted py-16">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>빠른 검색</CardTitle>
                  <CardDescription>
                    지역, 메뉴, 가격대 등 다양한 조건으로 원하는 식당을 쉽게 찾아보세요
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>간편한 예약</CardTitle>
                  <CardDescription>
                    원하는 날짜와 시간을 선택하여 실시간으로 예약 가능 여부를 확인하세요
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>대기열 관리</CardTitle>
                  <CardDescription>
                    온라인으로 대기열에 등록하고 실시간으로 순번을 확인하세요
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
