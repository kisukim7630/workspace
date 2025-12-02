# 주문 데이터 확인 가이드

로그에서는 주문 저장이 성공했지만 테이블에서 보이지 않는 경우 확인 방법입니다.

## ✅ 로그 확인 완료

터미널 로그에서 다음과 같이 성공 메시지가 보입니다:
```
✅ 주문 정보 저장 성공: [
  {
    id: 'xxx',
    order_id: 'order_xxx',
    ...
    created_at: '2025-12-02T04:41:41.474886+00:00'
  }
]
POST /api/payment/confirm 200
```

이것은 주문이 **실제로 DB에 저장되었다**는 의미입니다!

## 🔍 Supabase에서 데이터 확인 방법

### 1. Table Editor에서 확인

1. Supabase 대시보드 → **Table Editor** 메뉴
2. 왼쪽에서 **orders** 테이블 선택
3. 페이지 새로고침 (F5)
4. 데이터가 보이는지 확인

### 2. SQL Editor에서 직접 조회

Supabase → **SQL Editor**에서 실행:

```sql
-- 모든 주문 조회 (최신순)
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

```sql
-- 주문 개수 확인
SELECT COUNT(*) FROM orders;
```

```sql
-- 특정 상품의 주문 확인
SELECT * FROM orders 
WHERE product_id = 'your_product_id_here';
```

### 3. 주문이 정말 저장되었는지 확인

로그에 나온 `order_id`로 검색:

```sql
-- 로그에서 확인한 order_id 사용
SELECT * FROM orders 
WHERE order_id LIKE 'order_1733__%';
```

## ❓ 여전히 데이터가 안 보이는 경우

### 문제 1: 다른 Supabase 프로젝트를 보고 있음
- 여러 Supabase 프로젝트가 있다면, 올바른 프로젝트에 접속했는지 확인
- `.env` 파일의 `NEXT_PUBLIC_SUPABASE_URL`과 대시보드 URL이 일치하는지 확인

### 문제 2: 테이블 필터가 적용됨
- Table Editor 상단의 **Filter** 버튼 확인
- 필터가 있다면 **Clear filters** 클릭

### 문제 3: 캐시 문제
- 브라우저에서 Supabase 대시보드 강제 새로고침: `Ctrl + Shift + R`
- 또는 시크릿 모드로 접속

### 문제 4: RLS 정책 문제 (읽기 권한)
SQL Editor에서 실행:

```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- 읽기 정책이 없다면 추가
CREATE POLICY "Anyone can view orders" ON orders
  FOR SELECT
  USING (true);
```

## 🎯 상품 상세 페이지에서 확인

결제 완료한 상품 페이지로 가면:
- ✅ 회색 오버레이가 표시되어야 함
- ✅ "결제 완료" 메시지가 보여야 함
- ✅ 결제 버튼이 비활성화되어야 함

이것이 안 보인다면 상품 페이지를 새로고침하세요.

## 📊 디버깅용 SQL

```sql
-- 주문 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 최근 주문 상세 정보
SELECT 
  o.*,
  p.title as product_title,
  p.status as product_status
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
ORDER BY o.created_at DESC
LIMIT 5;
```

## ✨ 정상 작동 확인

다음 정보가 보이면 정상입니다:
- `order_id`: order_숫자_문자열
- `payment_key`: tgen_xxx 또는 test_xxx
- `product_id`: UUID
- `amount`: 결제 금액
- `status`: DONE
- `created_at`: 결제 시간

