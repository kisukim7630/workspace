-- 더미 데이터 삽입
INSERT INTO products (title, price, location, image_url, like_count, status) VALUES
('아이폰 14 프로 맥스 256GB', 850000, '서울시 강남구', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop', 12, '판매중'),
('에어팟 프로 2세대', 250000, '서울시 마포구', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop', 8, '판매중'),
('맥북 프로 14인치 M2', 1800000, '서울시 서초구', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop', 25, '예약중'),
('나이키 에어맥스 운동화', 120000, '서울시 송파구', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 5, '판매중'),
('갤럭시 버즈2 프로', 180000, '서울시 강동구', 'https://images.unsplash.com/photo-1606220945770-b5b7c2c55bf1?w=400&h=400&fit=crop', 3, '판매중'),
('아이패드 프로 12.9인치', 950000, '서울시 종로구', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', 15, '판매중'),
('에어컨 삼성 무풍', 450000, '서울시 노원구', 'https://images.unsplash.com/photo-1631541712601-7b8b8b8b8b8b?w=400&h=400&fit=crop', 7, '판매완료'),
('자전거 픽시', 280000, '서울시 성동구', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 9, '판매중'),
('게이밍 의자', 150000, '서울시 영등포구', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop', 4, '판매중'),
('캠핑 텐트 4인용', 320000, '서울시 강서구', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=400&fit=crop', 11, '판매중')
ON CONFLICT DO NOTHING;


