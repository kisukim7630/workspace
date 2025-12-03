"use client";

import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dummyStats = {
  todayReservations: 12,
  todayWaitlist: 8,
  pendingReservations: 5,
  totalRevenue: "1,250,000",
};

const dummyRecentReservations = [
  {
    id: "1",
    customerName: "김철수",
    time: "19:00",
    guests: 2,
    status: "confirmed",
  },
  {
    id: "2",
    customerName: "이영희",
    time: "20:00",
    guests: 4,
    status: "pending",
  },
  {
    id: "3",
    customerName: "박민수",
    time: "18:30",
    guests: 2,
    status: "confirmed",
  },
];

const dummyRecentWaitlist = [
  {
    id: "1",
    customerName: "정수진",
    queueNumber: 1,
    guests: 2,
    estimatedWait: "10분",
  },
  {
    id: "2",
    customerName: "최영호",
    queueNumber: 2,
    guests: 3,
    estimatedWait: "20분",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <TopNav />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">대시보드</h1>
            <p className="text-muted-foreground">식당 관리 현황을 한눈에 확인하세요</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dummyStats.todayReservations}</div>
                <p className="text-xs text-muted-foreground">건</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 대기열</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dummyStats.todayWaitlist}</div>
                <p className="text-xs text-muted-foreground">건</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">대기중 예약</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dummyStats.pendingReservations}</div>
                <p className="text-xs text-muted-foreground">건</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dummyStats.totalRevenue}원</div>
                <p className="text-xs text-muted-foreground">오늘 기준</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>최근 예약</CardTitle>
                <CardDescription>오늘의 예약 현황입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummyRecentReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{reservation.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.time} · {reservation.guests}명
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          reservation.status === "confirmed"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {reservation.status === "confirmed" ? "확정" : "대기중"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>대기열 현황</CardTitle>
                <CardDescription>현재 대기 중인 고객입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummyRecentWaitlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.guests}명 · 예상 대기: {item.estimatedWait}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {item.queueNumber}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
