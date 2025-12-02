-- 가계부 앱을 위한 Supabase 데이터베이스 스키마

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '기타',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 거래 내역 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 카테고리 데이터 삽입
INSERT INTO categories (name, icon, is_default) VALUES
  ('식비', '식비', TRUE),
  ('교통', '교통', TRUE),
  ('쇼핑', '쇼핑', TRUE),
  ('월급', '월급', TRUE),
  ('기타', '기타', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- RLS (Row Level Security) 정책 설정
-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (실제 프로덕션에서는 인증 추가 권장)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

-- 점심 메뉴 테이블
CREATE TABLE IF NOT EXISTS lunch_menus (
  id BIGSERIAL PRIMARY KEY,
  menu_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 점심 메뉴 투표 테이블
CREATE TABLE IF NOT EXISTS lunch_votes (
  id BIGSERIAL PRIMARY KEY,
  menu_id BIGINT NOT NULL REFERENCES lunch_menus(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_id, ip_address)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lunch_votes_menu_id ON lunch_votes(menu_id);
CREATE INDEX IF NOT EXISTS idx_lunch_votes_ip ON lunch_votes(ip_address);

-- RLS 정책 설정
ALTER TABLE lunch_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE lunch_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on lunch_menus" ON lunch_menus
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lunch_votes" ON lunch_votes
  FOR ALL USING (true) WITH CHECK (true);

-- 점심 추천 기록 테이블 (하루 1회 제한)
CREATE TABLE IF NOT EXISTS lunch_recommendations (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  recommended_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(ip_address, recommended_at)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lunch_recommendations_ip_date ON lunch_recommendations(ip_address, recommended_at);

-- RLS 정책 설정
ALTER TABLE lunch_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on lunch_recommendations" ON lunch_recommendations
  FOR ALL USING (true) WITH CHECK (true);


