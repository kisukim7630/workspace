-- 잘못된 판매완료 상태 복구

-- Step 1: 현재 상황 확인
SELECT 
  p.id,
  p.title,
  p.status,
  COUNT(o.id) as order_count
FROM products p
LEFT JOIN orders o ON p.id = o.product_id AND o.status = 'DONE'
WHERE p.status = '판매완료'
GROUP BY p.id, p.title, p.status;

-- Step 2: 주문이 없는데 판매완료인 상품을 판매중으로 변경
UPDATE products
SET status = '판매중'
WHERE status = '판매완료' 
  AND id NOT IN (
    SELECT DISTINCT product_id 
    FROM orders 
    WHERE status = 'DONE'
  );

-- Step 3: 결과 확인
SELECT 
  id,
  title,
  status,
  updated_at
FROM products
WHERE status = '판매완료'
ORDER BY updated_at DESC;


