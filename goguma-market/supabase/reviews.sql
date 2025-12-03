-- 리뷰 테이블 생성
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- 리뷰 내용
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1~5점
  comment TEXT,
  
  -- 리뷰 타입 (구매자 리뷰, 판매자 리뷰)
  review_type TEXT NOT NULL CHECK (review_type IN ('구매자', '판매자')),
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 한 주문에 대해 한 번만 리뷰 가능
  UNIQUE(order_id, reviewer_id, review_type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- RLS 활성화
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 리뷰를 읽을 수 있음
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT
  USING (true);

-- RLS 정책: 인증된 사용자만 리뷰 작성 가능
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- RLS 정책: 본인의 리뷰만 수정/삭제 가능
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 리뷰 작성 시 온도 증가 함수
CREATE OR REPLACE FUNCTION update_temperature_on_review()
RETURNS TRIGGER AS $$
DECLARE
  temperature_increase INTEGER;
BEGIN
  -- 평점에 따라 온도 증가량 결정
  -- 5점: +2도, 4점: +1도, 3점: 0도, 2점: -1도, 1점: -2도
  temperature_increase := CASE NEW.rating
    WHEN 5 THEN 2
    WHEN 4 THEN 1
    WHEN 3 THEN 0
    WHEN 2 THEN -1
    WHEN 1 THEN -2
    ELSE 0
  END;
  
  -- 리뷰 받은 사람의 온도 업데이트
  UPDATE profiles
  SET temperature = GREATEST(0, LEAST(100, temperature + temperature_increase))
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 리뷰 작성 시 온도 업데이트 트리거
CREATE TRIGGER update_temperature_on_review_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_temperature_on_review();

-- 리뷰 수정 시 온도 재계산
CREATE OR REPLACE FUNCTION recalculate_temperature_on_review_update()
RETURNS TRIGGER AS $$
DECLARE
  old_increase INTEGER;
  new_increase INTEGER;
  diff INTEGER;
BEGIN
  -- 이전 평점의 온도 증가량
  old_increase := CASE OLD.rating
    WHEN 5 THEN 2
    WHEN 4 THEN 1
    WHEN 3 THEN 0
    WHEN 2 THEN -1
    WHEN 1 THEN -2
    ELSE 0
  END;
  
  -- 새 평점의 온도 증가량
  new_increase := CASE NEW.rating
    WHEN 5 THEN 2
    WHEN 4 THEN 1
    WHEN 3 THEN 0
    WHEN 2 THEN -1
    WHEN 1 THEN -2
    ELSE 0
  END;
  
  -- 차이만큼 조정
  diff := new_increase - old_increase;
  
  IF diff != 0 THEN
    UPDATE profiles
    SET temperature = GREATEST(0, LEAST(100, temperature + diff))
    WHERE id = NEW.reviewee_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_temperature_on_review_update_trigger
  AFTER UPDATE ON reviews
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
  EXECUTE FUNCTION recalculate_temperature_on_review_update();

-- 리뷰 삭제 시 온도 감소
CREATE OR REPLACE FUNCTION decrease_temperature_on_review_delete()
RETURNS TRIGGER AS $$
DECLARE
  temperature_decrease INTEGER;
BEGIN
  -- 삭제된 리뷰의 평점에 따라 온도 감소
  temperature_decrease := CASE OLD.rating
    WHEN 5 THEN -2
    WHEN 4 THEN -1
    WHEN 3 THEN 0
    WHEN 2 THEN 1
    WHEN 1 THEN 2
    ELSE 0
  END;
  
  UPDATE profiles
  SET temperature = GREATEST(0, LEAST(100, temperature + temperature_decrease))
  WHERE id = OLD.reviewee_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER decrease_temperature_on_review_delete_trigger
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION decrease_temperature_on_review_delete();

COMMENT ON TABLE reviews IS '거래 리뷰 테이블';
COMMENT ON COLUMN reviews.rating IS '평점 (1~5점)';
COMMENT ON COLUMN reviews.review_type IS '리뷰 타입: 구매자 리뷰 또는 판매자 리뷰';

