"use client";

import Link from "next/link";
import { Clock, Users, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWaitlist } from "@/features/restaurants/hooks/useWaitlist";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

const statusLabels = {
  waiting: "대기중",
  next: "곧 입장",
  called: "입장 호출",
  cancelled: "취소",
};

const statusVariants = {
  waiting: "secondary",
  next: "default",
  called: "default",
  cancelled: "outline",
} as const;

export default function WaitlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();
  const { data: waitlist, isLoading, error } = useWaitlist();

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
            <h1 className="mb-2 text-3xl font-bold">대기 내역</h1>
            <p className="text-muted-foreground">나의 대기열 현황을 확인하세요</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4">
            {!waitlist || waitlist.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">대기 내역이 없습니다</p>
                  <Button className="mt-4" asChild>
                    <Link href="/search">식당 검색하기</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {waitlist.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {item.restaurantImageUrl && (
                            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                              <img
                                src={item.restaurantImageUrl}
                                alt={item.restaurantName || "식당"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <CardTitle className="mb-2">
                              {item.restaurantName || "식당"}
                            </CardTitle>
                            {item.restaurantLocation && (
                              <CardDescription className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {item.restaurantLocation}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            statusVariants[item.status as keyof typeof statusVariants]
                          }
                        >
                          {statusLabels[item.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 rounded-lg bg-primary/10 p-4">
                        <div className="text-center">
                          <div className="mb-2 text-2xl font-bold text-primary">
                            {item.queueNumber}번째
                          </div>
                          {item.estimatedWaitMinutes && (
                            <div className="text-sm text-muted-foreground">
                              예상 대기 시간: 약 {item.estimatedWaitMinutes}분
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{item.guests}명</span>
                        </div>
                        {(item.phone || item.restaurantPhone) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{item.phone || item.restaurantPhone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/restaurant/${item.restaurantId}`}>식당 정보</Link>
                        </Button>
                        {item.status !== "cancelled" && (
                          <Button variant="destructive" size="sm">
                            대기 취소
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
