-- likes 테이블 생성 (사용자의 상품 좋아요 관리)
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 한 사용자가 같은 상품에 중복 좋아요 방지
  UNIQUE(user_id, product_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_product_id ON likes(product_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_product ON likes(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 좋아요 정보를 읽을 수 있음
CREATE POLICY "Anyone can read likes" ON likes
  FOR SELECT
  USING (true);

-- 로그인한 사용자만 좋아요를 추가할 수 있음
CREATE POLICY "Authenticated users can insert likes" ON likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 좋아요만 삭제할 수 있음
CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- products 테이블의 like_count를 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_product_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 좋아요 추가시 카운트 증가
    UPDATE products
    SET like_count = like_count + 1
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 좋아요 삭제시 카운트 감소
    UPDATE products
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 좋아요 추가/삭제시 자동으로 카운트 업데이트하는 트리거
DROP TRIGGER IF EXISTS trigger_update_like_count_on_insert ON likes;
CREATE TRIGGER trigger_update_like_count_on_insert
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_product_like_count();

DROP TRIGGER IF EXISTS trigger_update_like_count_on_delete ON likes;
CREATE TRIGGER trigger_update_like_count_on_delete
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_product_like_count();

-- 기존 products의 like_count를 실제 likes 테이블의 데이터와 동기화
UPDATE products
SET like_count = (
  SELECT COUNT(*)
  FROM likes
  WHERE likes.product_id = products.id
);

