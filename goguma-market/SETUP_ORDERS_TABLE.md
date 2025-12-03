# 주문 테이블 설정 가이드

결제 완료 정보를 저장하려면 Supabase에 주문 테이블을 생성해야 합니다.

## 설정 방법

### 1. Supabase 대시보드 접속
1. https://supabase.com 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2. SQL 실행
`supabase/orders.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행하세요.

또는 아래 SQL을 직접 실행:

```sql
-- 주문(결제) 테이블 생성
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  payment_key TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  order_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DONE',
  
  method TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  customer_name TEXT,
  customer_email TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);

-- RLS 활성화
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can view orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (true);
```

### 3. 테이블 생성 확인

SQL Editor에서 다음 쿼리를 실행하여 테이블이 생성되었는지 확인:

```sql
SELECT * FROM orders LIMIT 1;
```

오류 없이 실행되면 성공입니다!

## 문제 해결

### "relation orders does not exist" 오류
→ 주문 테이블이 생성되지 않았습니다. 위의 SQL을 다시 실행하세요.

### "permission denied" 오류
→ RLS 정책이 올바르게 설정되지 않았습니다. RLS 정책 SQL을 다시 실행하세요.

### "foreign key constraint" 오류
→ products 테이블이 먼저 생성되어야 합니다. `supabase/schema.sql`을 먼저 실행하세요.


