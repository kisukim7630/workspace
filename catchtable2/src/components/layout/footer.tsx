"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">맛집예약</h3>
            <p className="text-sm text-muted-foreground">
              쉽고 빠른 식당 예약 및 대기 관리 플랫폼
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-foreground">
                  식당 검색
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-foreground">
                  예약 내역
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="hover:text-foreground">
                  대기 내역
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">고객지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 맛집예약. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

