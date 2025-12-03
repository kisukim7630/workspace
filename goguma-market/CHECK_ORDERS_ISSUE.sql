-- 주문과 상품 상태 확인 쿼리

-- 1. 모든 주문 확인 (최근 순)
SELECT 
  o.id,
  o.order_id,
  o.product_id,
  o.order_name,
  o.amount,
  o.status as order_status,
  o.created_at,
  p.title as product_title,
  p.status as product_status
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
ORDER BY o.created_at DESC;

-- 2. 판매완료 상태인 상품들
SELECT 
  p.id,
  p.title,
  p.status,
  p.price,
  COUNT(o.id) as order_count
FROM products p
LEFT JOIN orders o ON p.id = o.product_id
WHERE p.status = '판매완료'
GROUP BY p.id, p.title, p.status, p.price
ORDER BY p.updated_at DESC;

-- 3. 주문이 없는데 판매완료인 상품 찾기 (문제 상품)
SELECT 
  p.id,
  p.title,
  p.status,
  p.price
FROM products p
LEFT JOIN orders o ON p.id = o.product_id
WHERE p.status = '판매완료' AND o.id IS NULL;

-- 4. 잘못된 상태 복구 (주문이 없는 상품을 판매중으로 변경)
-- 주의: 실행하기 전에 위의 쿼리로 확인 후 실행하세요
/*
UPDATE products
SET status = '판매중'
WHERE status = '판매완료' 
  AND id NOT IN (SELECT DISTINCT product_id FROM orders WHERE status = 'DONE');
*/


