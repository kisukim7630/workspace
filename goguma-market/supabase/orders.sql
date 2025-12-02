-- 주문(결제) 테이블 생성
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE, -- 토스페이먼츠 주문 ID
  payment_key TEXT NOT NULL UNIQUE, -- 토스페이먼츠 결제 키
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- 주문 정보
  order_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DONE' CHECK (status IN ('READY', 'IN_PROGRESS', 'WAITING_FOR_DEPOSIT', 'DONE', 'CANCELED', 'PARTIAL_CANCELED', 'ABORTED', 'EXPIRED')),
  
  -- 결제 정보
  method TEXT, -- 결제 수단 (카드, 가상계좌, 계좌이체 등)
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- 고객 정보
  customer_name TEXT,
  customer_email TEXT,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_key ON orders(payment_key);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- RLS 활성화
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 주문 정보를 조회할 수 있음 (상품 상태 확인용)
CREATE POLICY "Anyone can view orders" ON orders
  FOR SELECT
  USING (true);

-- RLS 정책: 서버에서 주문 생성 가능 (Service Role Key 사용)
-- 인증된 사용자도 주문 생성 가능
CREATE POLICY "Service role can create orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- RLS 정책: 본인의 주문만 수정 가능
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- 주문 완료 시 상품 상태를 '판매완료'로 변경하는 트리거
CREATE OR REPLACE FUNCTION update_product_status_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'DONE' THEN
    UPDATE products
    SET status = '판매완료'
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_status_on_order_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'DONE')
  EXECUTE FUNCTION update_product_status_on_order();

COMMENT ON TABLE orders IS '주문(결제) 정보 테이블';
COMMENT ON COLUMN orders.order_id IS '토스페이먼츠 주문 ID';
COMMENT ON COLUMN orders.payment_key IS '토스페이먼츠 결제 키';
COMMENT ON COLUMN orders.status IS '결제 상태';

