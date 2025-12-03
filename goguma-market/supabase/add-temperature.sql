-- profiles 테이블에 temperature 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS temperature INTEGER DEFAULT 36 CHECK (temperature >= 0 AND temperature <= 100);

-- 기존 사용자의 온도 초기화 (기본 36도)
UPDATE profiles 
SET temperature = 36 
WHERE temperature IS NULL;

-- 거래 완료 시 온도 증가 함수
CREATE OR REPLACE FUNCTION increase_temperature_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- 주문 완료 시 판매자 온도 +1도 증가
  IF NEW.status = 'DONE' THEN
    UPDATE profiles
    SET temperature = LEAST(100, temperature + 1)
    WHERE id = (
      SELECT user_id 
      FROM products 
      WHERE id = NEW.product_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 거래 완료 시 온도 증가 트리거
DROP TRIGGER IF EXISTS increase_temperature_on_order_trigger ON orders;
CREATE TRIGGER increase_temperature_on_order_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'DONE')
  EXECUTE FUNCTION increase_temperature_on_order();

-- 온도 통계 함수 (평균 온도, 최고 온도 등)
CREATE OR REPLACE FUNCTION get_temperature_stats()
RETURNS TABLE (
  avg_temperature NUMERIC,
  max_temperature INTEGER,
  min_temperature INTEGER,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(temperature)::NUMERIC, 1) as avg_temperature,
    MAX(temperature)::INTEGER as max_temperature,
    MIN(temperature)::INTEGER as min_temperature,
    COUNT(*)::BIGINT as total_users
  FROM profiles;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN profiles.temperature IS '사용자 온도 (0~100도, 기본 36도)';

