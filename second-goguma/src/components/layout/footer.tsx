"use client";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">고구마 마켓</h3>
            <p className="text-sm text-muted-foreground">
              지역 기반 중고 거래 플랫폼으로 합리적인 소비를 지원합니다.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">서비스</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/search" className="hover:text-foreground">
                  상품 검색
                </a>
              </li>
              <li>
                <a href="/products/new" className="hover:text-foreground">
                  상품 등록
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">고객지원</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>이용약관</li>
              <li>개인정보처리방침</li>
              <li>문의하기</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 고구마 마켓. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

