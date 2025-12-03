# 잘못된 판매완료 상태 수정하기

결제하지 않은 상품이 판매완료로 표시되는 문제 해결 방법입니다.

## 🔍 문제 확인

### 1. Supabase SQL Editor에서 확인

```sql
-- 판매완료 상품과 실제 주문 비교
SELECT 
  p.id,
  p.title,
  p.status,
  COUNT(o.id) as order_count
FROM products p
LEFT JOIN orders o ON p.id = o.product_id AND o.status = 'DONE'
WHERE p.status = '판매완료'
GROUP BY p.id, p.title, p.status;
```

**확인할 것:**
- `order_count`가 0인 상품 = 주문 없는데 판매완료 (문제!)
- `order_count`가 1 이상인 상품 = 정상

## ✅ 즉시 해결 방법

### Supabase SQL Editor에서 실행:

```sql
-- 주문이 없는 상품을 판매중으로 복구
UPDATE products
SET status = '판매중'
WHERE status = '판매완료' 
  AND id NOT IN (
    SELECT DISTINCT product_id 
    FROM orders 
    WHERE status = 'DONE'
  );
```

이 쿼리는:
- 판매완료 상태이지만
- 실제로 완료된 주문(DONE)이 없는 상품을
- 판매중으로 되돌립니다

## 🔍 문제 원인 가능성

### 1. 테스트 중 여러 번 결제 시도
- 결제 페이지까지 갔다가 취소
- 여러 상품을 테스트
- 트리거가 잘못 실행됨

### 2. 수동으로 상태 변경
- Supabase Table Editor에서 직접 수정

### 3. 트리거 오작동
- orders 테이블 INSERT 시 트리거 실행
- product_id가 잘못 전달됨

## 🛡️ 예방 방법

### 1. 트리거에 안전장치 추가

현재 트리거를 더 안전하게 수정:

```sql
-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS update_product_status_on_order_trigger ON orders;
DROP FUNCTION IF EXISTS update_product_status_on_order();

-- 개선된 트리거 함수
CREATE OR REPLACE FUNCTION update_product_status_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- 결제 완료 상태일 때만
  IF NEW.status = 'DONE' THEN
    -- 해당 상품의 다른 완료 주문이 있는지 확인
    -- 없을 때만 상태 변경 (중복 방지)
    UPDATE products
    SET status = '판매완료'
    WHERE id = NEW.product_id
      AND status != '판매완료';  -- 이미 판매완료가 아닐 때만
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성
CREATE TRIGGER update_product_status_on_order_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'DONE')
  EXECUTE FUNCTION update_product_status_on_order();
```

### 2. 정기 점검 쿼리

주기적으로 실행하여 데이터 정합성 확인:

```sql
-- 주문 없는데 판매완료인 상품 찾기
SELECT 
  p.id,
  p.title,
  p.status
FROM products p
LEFT JOIN orders o ON p.id = o.product_id AND o.status = 'DONE'
WHERE p.status = '판매완료' AND o.id IS NULL;
```

## 📊 상태 확인 대시보드

```sql
-- 전체 상황 요약
SELECT 
  p.status,
  COUNT(*) as product_count,
  COUNT(o.id) as order_count
FROM products p
LEFT JOIN orders o ON p.id = o.product_id AND o.status = 'DONE'
GROUP BY p.status
ORDER BY p.status;
```

## 🔄 복구 후 확인

복구 쿼리 실행 후:

1. **브라우저 새로고침** (Ctrl + F5)
2. **홈 화면 확인** - 판매완료 표시 사라짐
3. **결제한 상품만 판매완료** 표시되는지 확인

## ⚠️ 주의사항

- 이 문제는 개발/테스트 중에만 발생
- 실제 서비스에서는 결제 성공 시에만 주문 생성
- 토스페이먼츠가 결제를 검증하므로 안전

## 💡 추가 개선 (선택사항)

주문 취소 시 상품 상태 복구:

```sql
CREATE OR REPLACE FUNCTION restore_product_status_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- 결제 취소/환불 시
  IF NEW.status IN ('CANCELED', 'PARTIAL_CANCELED', 'ABORTED') 
     AND OLD.status = 'DONE' THEN
    UPDATE products
    SET status = '판매중'
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restore_product_on_cancel_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_status_on_cancel();
```


