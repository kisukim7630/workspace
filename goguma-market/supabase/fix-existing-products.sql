-- 기존 상품에 user_id가 NULL인 경우 임시로 처리
-- 방법 1: 기존 상품 삭제 (개발 중이라면)
-- DELETE FROM products WHERE user_id IS NULL;

-- 방법 2: 기존 상품에 현재 사용자 ID 할당 (임시)
-- 현재 로그인한 사용자 ID로 업데이트하거나, 
-- Supabase 대시보드에서 직접 user_id를 설정하세요

-- 방법 3: RLS 정책을 임시로 완화 (개발용)
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;

-- 임시 정책: 인증된 사용자는 모든 상품 수정/삭제 가능 (개발용)
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 나중에 본인 상품만 수정/삭제하도록 하려면:
-- DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
-- DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
--
-- CREATE POLICY "Users can update own products" ON products
--   FOR UPDATE
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete own products" ON products
--   FOR DELETE
--   USING (auth.uid() = user_id);

