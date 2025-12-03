-- products 테이블에 user_id 컬럼 추가
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- user_id 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- RLS 정책 업데이트 (기존 정책은 유지)
-- 사용자는 자신이 등록한 상품만 수정/삭제 가능
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE
  USING (auth.uid() = user_id);

-- 읽기는 여전히 모두 가능 (중고거래 특성상)
-- INSERT는 인증된 사용자만 가능하도록 변경
DROP POLICY IF EXISTS "Anyone can insert products" ON products;

CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);


