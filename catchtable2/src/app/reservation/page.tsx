"use client";

import Link from "next/link";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReservations } from "@/features/restaurants/hooks/useReservations";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

const statusLabels = {
  confirmed: "확정",
  pending: "대기중",
  completed: "완료",
  cancelled: "취소",
};

const statusVariants = {
  confirmed: "default",
  pending: "secondary",
  completed: "outline",
  cancelled: "destructive",
} as const;

export default function ReservationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();
  const { data: reservations, isLoading, error } = useReservations();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 text-center">
          <p className="text-destructive">오류가 발생했습니다: {error.message}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-background py-8">
          <div className="container px-4">
            <h1 className="mb-2 text-3xl font-bold">예약 내역</h1>
            <p className="text-muted-foreground">나의 예약 내역을 확인하세요</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4">
            {!reservations || reservations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">예약 내역이 없습니다</p>
                  <Button className="mt-4" asChild>
                    <Link href="/search">식당 검색하기</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {reservation.restaurantImageUrl && (
                            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                              <img
                                src={reservation.restaurantImageUrl}
                                alt={reservation.restaurantName || "식당"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <CardTitle className="mb-2">
                              {reservation.restaurantName || "식당"}
                            </CardTitle>
                            {reservation.restaurantLocation && (
                              <CardDescription className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {reservation.restaurantLocation}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            statusVariants[
                              reservation.status as keyof typeof statusVariants
                            ]
                          }
                        >
                          {statusLabels[reservation.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.reservationDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.reservationTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.guests}명</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/restaurant/${reservation.restaurantId}`}>
                            상세보기
                          </Link>
                        </Button>
                        {reservation.status === "confirmed" && (
                          <Button variant="destructive" size="sm">
                            예약 취소
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
