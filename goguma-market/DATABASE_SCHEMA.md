# 📊 Supabase 데이터베이스 구조

## 📋 테이블 목록

현재 Supabase에 생성된 테이블들:

1. **products** - 상품 테이블 (13개 행)
2. **profiles** - 사용자 프로필 테이블 (1개 행)
3. **likes** - 좋아요 테이블 (0개 행)
4. **orders** - 주문(결제) 테이블 (1개 행)
5. **lunch_menus** - 점심 메뉴 테이블 (0개 행) ⚠️ 다른 프로젝트용
6. **lunch_votes** - 점심 투표 테이블 (0개 행) ⚠️ 다른 프로젝트용
7. **lunch_recommendations** - 점심 추천 테이블 (0개 행) ⚠️ 다른 프로젝트용

---

## 🛍️ 1. products (상품 테이블)

### 컬럼 구조

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY, 기본값: `gen_random_uuid()` | 상품 고유 ID |
| `title` | TEXT | NOT NULL | 상품 제목 |
| `price` | INTEGER | NOT NULL | 상품 가격 |
| `location` | TEXT | NOT NULL | 판매 위치 |
| `image_url` | TEXT | NOT NULL | 상품 이미지 URL |
| `like_count` | INTEGER | NULL 가능, 기본값: 0 | 좋아요 개수 |
| `status` | TEXT | NULL 가능, 기본값: '판매중' | 판매 상태 |
| | | CHECK: `'판매중', '예약중', '판매완료'` | |
| `created_at` | TIMESTAMPTZ | NULL 가능, 기본값: `now()` | 생성 시간 |
| `updated_at` | TIMESTAMPTZ | NULL 가능, 기본값: `now()` | 수정 시간 |
| `user_id` | UUID | NULL 가능 | 판매자 ID (외래키: `auth.users.id`) |

### 인덱스
- `idx_products_status` - status 컬럼
- `idx_products_created_at` - created_at 컬럼 (DESC)

### 외래키 관계
- `products.user_id` → `auth.users.id`
- `orders.product_id` → `products.id` (CASCADE 삭제)
- `likes.product_id` → `products.id` (CASCADE 삭제)

### RLS 정책
- ✅ 모든 사용자: SELECT, INSERT, UPDATE 가능

### 트리거
- `update_products_updated_at` - UPDATE 시 `updated_at` 자동 업데이트

---

## 👤 2. profiles (사용자 프로필 테이블)

### 컬럼 구조

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY | 사용자 ID (외래키: `auth.users.id`) |
| `email` | TEXT | NOT NULL | 이메일 |
| `nickname` | TEXT | UNIQUE | 닉네임 (고유) |
| `avatar_url` | TEXT | NULL 가능 | 프로필 이미지 URL |
| `bio` | TEXT | NULL 가능 | 자기소개 |
| `phone` | TEXT | NULL 가능 | 전화번호 |
| `location` | TEXT | NULL 가능 | 위치 |
| `created_at` | TIMESTAMPTZ | NULL 가능, 기본값: `now()` | 생성 시간 |
| `updated_at` | TIMESTAMPTZ | NULL 가능, 기본값: `now()` | 수정 시간 |

### 인덱스
- `idx_profiles_nickname` - nickname 컬럼
- `idx_profiles_email` - email 컬럼

### 외래키 관계
- `profiles.id` → `auth.users.id` (CASCADE 삭제)

### RLS 정책
- ✅ 모든 사용자: SELECT 가능
- ✅ 본인만: INSERT, UPDATE, DELETE 가능

### 트리거
- `on_auth_user_created` - 새 사용자 가입 시 자동 프로필 생성
- `update_profiles_updated_at` - UPDATE 시 `updated_at` 자동 업데이트

---

## ❤️ 3. likes (좋아요 테이블)

### 컬럼 구조

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY, 기본값: `gen_random_uuid()` | 좋아요 고유 ID |
| `user_id` | UUID | NOT NULL | 사용자 ID (외래키: `auth.users.id`) |
| `product_id` | UUID | NOT NULL | 상품 ID (외래키: `products.id`) |
| `created_at` | TIMESTAMPTZ | NULL 가능, 기본값: `now()` | 생성 시간 |
| **UNIQUE 제약조건** | | `(user_id, product_id)` | 중복 좋아요 방지 |

### 인덱스
- `idx_likes_user_id` - user_id 컬럼
- `idx_likes_product_id` - product_id 컬럼
- `idx_likes_user_product` - (user_id, product_id) 복합 인덱스
- `idx_likes_created_at` - created_at 컬럼 (DESC)

### 외래키 관계
- `likes.user_id` → `auth.users.id` (CASCADE 삭제)
- `likes.product_id` → `products.id` (CASCADE 삭제)

### RLS 정책
- ✅ 모든 사용자: SELECT 가능
- ✅ 인증된 사용자만: INSERT 가능 (본인만)
- ✅ 본인만: DELETE 가능

### 트리거
- `trigger_update_like_count_on_insert` - 좋아요 추가 시 `products.like_count` 증가
- `trigger_update_like_count_on_delete` - 좋아요 삭제 시 `products.like_count` 감소

---

## 💳 4. orders (주문/결제 테이블)

### 컬럼 구조

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `id` | UUID | PRIMARY KEY, 기본값: `gen_random_uuid()` | 주문 고유 ID |
| `order_id` | TEXT | NOT NULL, UNIQUE | 토스페이먼츠 주문 ID |
| `payment_key` | TEXT | NOT NULL, UNIQUE | 토스페이먼츠 결제 키 |
| `user_id` | UUID | NULL 가능 | 구매자 ID (외래키: `auth.users.id`) |
| `product_id` | UUID | NOT NULL | 상품 ID (외래키: `products.id`) |
| `order_name` | TEXT | NOT NULL | 주문명 |
| `amount` | INTEGER | NOT NULL | 결제 금액 |
| `status` | TEXT | NOT NULL, 기본값: 'DONE' | 결제 상태 |
| | | CHECK: `'READY', 'IN_PROGRESS', 'WAITING_FOR_DEPOSIT', 'DONE', 'CANCELED', 'PARTIAL_CANCELED', 'ABORTED', 'EXPIRED'` | |
| `method` | TEXT | NULL 가능 | 결제 수단 (카드, 계좌이체 등) |
| `approved_at` | TIMESTAMPTZ | NULL 가능 | 결제 승인 시간 |
| `customer_name` | TEXT | NULL 가능 | 고객명 |
| `customer_email` | TEXT | NULL 가능 | 고객 이메일 |
| `created_at` | TIMESTAMPTZ | NULL 가능, 기본값: `now()` | 생성 시간 |
| `updated_at` | TIMESTAMPTZ | NULL 가능, 기본값: `now()` | 수정 시간 |

### 인덱스
- `idx_orders_user_id` - user_id 컬럼
- `idx_orders_product_id` - product_id 컬럼
- `idx_orders_order_id` - order_id 컬럼
- `idx_orders_payment_key` - payment_key 컬럼
- `idx_orders_status` - status 컬럼

### 외래키 관계
- `orders.user_id` → `auth.users.id` (SET NULL 삭제)
- `orders.product_id` → `products.id` (CASCADE 삭제)

### RLS 정책
- ✅ 모든 사용자: SELECT 가능
- ✅ 모든 사용자: INSERT 가능 (서버 API용)
- ✅ 본인만: UPDATE 가능

### 트리거
- `update_orders_updated_at_trigger` - UPDATE 시 `updated_at` 자동 업데이트
- `update_product_status_on_order_trigger` - 주문 상태가 'DONE'일 때 `products.status`를 '판매완료'로 변경

---

## 🔗 테이블 관계도

```
auth.users (Supabase 인증)
    │
    ├── profiles (1:1)
    │   └── id → auth.users.id
    │
    ├── products (1:N)
    │   └── user_id → auth.users.id
    │
    ├── likes (1:N)
    │   └── user_id → auth.users.id
    │
    └── orders (1:N)
        └── user_id → auth.users.id

products
    │
    ├── likes (1:N)
    │   └── product_id → products.id
    │
    └── orders (1:N)
        └── product_id → products.id
```

---

## 📊 현재 데이터 현황

- **products**: 13개 상품
- **profiles**: 1개 프로필
- **likes**: 0개 좋아요
- **orders**: 1개 주문 ✅

---

## ⚠️ 주의사항

### 다른 프로젝트 테이블
다음 테이블들은 이 프로젝트와 무관한 다른 프로젝트의 테이블입니다:
- `lunch_menus`
- `lunch_votes`
- `lunch_recommendations`

필요시 삭제해도 됩니다.

---

## 🔍 유용한 쿼리

### 상품과 주문 조인
```sql
SELECT 
  p.id,
  p.title,
  p.status as product_status,
  p.price,
  COUNT(o.id) as order_count
FROM products p
LEFT JOIN orders o ON p.id = o.product_id AND o.status = 'DONE'
GROUP BY p.id, p.title, p.status, p.price;
```

### 판매완료 상품 확인
```sql
SELECT 
  p.*,
  o.order_id,
  o.amount,
  o.approved_at
FROM products p
INNER JOIN orders o ON p.id = o.product_id
WHERE p.status = '판매완료' AND o.status = 'DONE';
```

### 사용자별 주문 내역
```sql
SELECT 
  o.*,
  p.title as product_title,
  p.price as product_price
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
WHERE o.user_id = 'user_id_here'
ORDER BY o.created_at DESC;
```

