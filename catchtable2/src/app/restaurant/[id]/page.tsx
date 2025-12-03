"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Star, MapPin, Clock, Phone, Calendar, Users, MessageSquare } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRestaurant } from "@/features/restaurants/hooks/useRestaurant";
import { useRestaurantMenus } from "@/features/restaurants/hooks/useRestaurantMenus";
import { useRestaurantReviews } from "@/features/restaurants/hooks/useRestaurantReviews";
import { useCreateReservation } from "@/features/restaurants/hooks/useReservations";
import { useCreateWaitlist } from "@/features/restaurants/hooks/useWaitlist";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function RestaurantPage({ params }: PageProps) {
  const { id } = use(params);
  
  // 디버깅: 페이지가 렌더링되고 id가 전달되는지 확인
  useEffect(() => {
    console.log("RestaurantPage rendered with id:", id, "Type:", typeof id);
  }, [id]);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [reservationGuests, setReservationGuests] = useState(1);
  const [waitlistGuests, setWaitlistGuests] = useState(1);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();
  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useRestaurant(id);
  const { data: menus, isLoading: menusLoading } = useRestaurantMenus(id);
  const { data: reviews, isLoading: reviewsLoading } = useRestaurantReviews(id);
  const createReservation = useCreateReservation();
  const createWaitlist = useCreateWaitlist();
  
  // 디버깅: API 호출 상태 확인
  useEffect(() => {
    if (restaurantError) {
      console.error("Restaurant fetch error:", restaurantError);
    }
    if (restaurant) {
      console.log("Restaurant loaded:", restaurant.id, restaurant.name);
    }
  }, [restaurant, restaurantError]);

  const handleReservationSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!reservationDate || !reservationTime) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }

    try {
      await createReservation.mutateAsync({
        restaurantId: id,
        reservationDate,
        reservationTime,
        guests: reservationGuests,
      });
      setIsReservationDialogOpen(false);
      alert("예약이 완료되었습니다!");
      router.push("/reservations");
    } catch (error) {
      alert("예약 중 오류가 발생했습니다.");
    }
  };

  const handleWaitlistSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await createWaitlist.mutateAsync({
        restaurantId: id,
        guests: waitlistGuests,
      });
      setIsWaitlistDialogOpen(false);
      alert("대기열에 등록되었습니다!");
      router.push("/waitlist");
    } catch (error) {
      alert("대기열 등록 중 오류가 발생했습니다.");
    }
  };

  const images = restaurant?.imageUrl
    ? [restaurant.imageUrl]
    : ["https://picsum.photos/800/600?random=1"];

  // 디버깅: 로딩 상태 확인
  useEffect(() => {
    console.log("Restaurant loading state:", {
      isLoading: restaurantLoading,
      hasRestaurant: !!restaurant,
      id,
      error: restaurantError,
    });
  }, [restaurantLoading, restaurant, id, restaurantError]);

  if (restaurantLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 text-center">
          <p className="text-muted-foreground">로딩 중... (ID: {id})</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (restaurantError) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 text-center">
          <p className="text-destructive">
            오류가 발생했습니다: {restaurantError.message} (ID: {id})
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 text-center">
          <p className="text-destructive">식당을 찾을 수 없습니다. (ID: {id})</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8">
          <div className="container px-4">
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={images[selectedImageIndex] || images[0]}
                    alt={restaurant.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-20 w-20 overflow-hidden rounded-md ${
                          selectedImageIndex === index ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${restaurant.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4">
                  <h1 className="mb-2 text-3xl font-bold">{restaurant.name}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({restaurant.reviewCount})
                      </span>
                    </div>
                    <Badge>{restaurant.cuisine}</Badge>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  {restaurant.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {restaurant.address}
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {restaurant.phone}
                    </div>
                  )}
                  {restaurant.hours && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {restaurant.hours}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    가격대: {restaurant.priceRange}
                  </div>
                </div>

                {restaurant.description && (
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {restaurant.description}
                  </p>
                )}

                <div className="flex gap-3">
                  <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        예약하기
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>예약하기</DialogTitle>
                        <DialogDescription>
                          예약 정보를 입력해주세요
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="date">날짜</Label>
                          <Input
                            id="date"
                            type="date"
                            value={reservationDate}
                            onChange={(e) => setReservationDate(e.target.value)}
                            className="mt-1"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">시간</Label>
                          <Input
                            id="time"
                            type="time"
                            value={reservationTime}
                            onChange={(e) => setReservationTime(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="guests">인원수</Label>
                          <Input
                            id="guests"
                            type="number"
                            min="1"
                            value={reservationGuests}
                            onChange={(e) => setReservationGuests(Number(e.target.value))}
                            placeholder="인원수"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsReservationDialogOpen(false)}
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleReservationSubmit}
                          disabled={createReservation.isPending}
                        >
                          {createReservation.isPending ? "처리 중..." : "예약 확정"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isWaitlistDialogOpen} onOpenChange={setIsWaitlistDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="flex-1">
                        <Users className="mr-2 h-4 w-4" />
                        대기 등록
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>대기열 등록</DialogTitle>
                        <DialogDescription>
                          대기열에 등록하시겠습니까?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="waitlist-guests">인원수</Label>
                          <Input
                            id="waitlist-guests"
                            type="number"
                            min="1"
                            value={waitlistGuests}
                            onChange={(e) => setWaitlistGuests(Number(e.target.value))}
                            placeholder="인원수"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsWaitlistDialogOpen(false)}
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleWaitlistSubmit}
                          disabled={createWaitlist.isPending}
                        >
                          {createWaitlist.isPending ? "처리 중..." : "대기 등록"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">메뉴</h2>
              {menusLoading ? (
                <p className="text-muted-foreground">로딩 중...</p>
              ) : menus && menus.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {menus.map((menu) => (
                    <Card key={menu.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{menu.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium text-primary">{menu.price}</p>
                        {menu.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {menu.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">메뉴 정보가 없습니다.</p>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">리뷰</h2>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  리뷰 작성
                </Button>
              </div>
              {reviewsLoading ? (
                <p className="text-muted-foreground">로딩 중...</p>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {review.userEmail || "익명"}
                            </CardTitle>
                            <CardDescription>
                              {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      {review.comment && (
                        <CardContent>
                          <p className="text-sm">{review.comment}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">리뷰가 없습니다.</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
