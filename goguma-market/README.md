# 🍠 고구마마켓

중고거래 플랫폼

## 시작하기

### 1. 환경 변수 설정

**중요**: 프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 토스페이먼츠 (결제 기능 사용시 필수)
# 테스트 키 (개발용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
TOSS_SECRET_KEY=test_sk_docs_Ovk5rk1EwkEbP0W43n07xlzm

# 실제 서비스에서는 토스페이먼츠 개발자센터에서 발급받은 키를 사용하세요
# NEXT_PUBLIC_TOSS_CLIENT_KEY=your_real_client_key
# TOSS_SECRET_KEY=your_real_secret_key
```

> ⚠️ **주의**: `.env` 파일은 Git에 커밋되지 않습니다. 팀원과 공유할 때는 별도로 전달하세요.

### 2. 데이터베이스 설정

Supabase 대시보드의 SQL Editor에서 다음 순서로 실행하세요:

1. **상품 테이블 생성**: `supabase/schema.sql` 파일의 내용을 실행
2. **프로필 테이블 생성**: `supabase/profiles.sql` 파일의 내용을 실행
3. **좋아요 테이블 생성**: `supabase/likes.sql` 파일의 내용을 실행
4. **주문 테이블 생성**: `supabase/orders.sql` 파일의 내용을 실행 ⭐ NEW
5. **스토리지 설정**: `supabase/storage-setup.sql` 파일의 내용을 실행
6. **상품에 user_id 추가**: `supabase/add-user-id.sql` 파일의 내용을 실행
7. **더미 데이터 삽입**: `supabase/seed.sql` 파일의 내용을 실행 (선택사항)

또는 Supabase 대시보드에서 직접 실행:

```sql
-- 테이블 생성
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  status TEXT DEFAULT '판매중' CHECK (status IN ('판매중', '예약중', '판매완료')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
('캠핑 텐트 4인용', 320000, '서울시 강서구', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=400&fit=crop', 11, '판매중');
```

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 기능

### ✨ 핵심 기능
- 🏠 **홈 페이지**: 모든 상품 목록 조회 및 검색
- 📝 **상품 등록/수정/삭제**: 인증된 사용자만 상품 관리 가능
- ❤️ **좋아요 기능**: 관심 상품에 좋아요 추가/취소
- 💳 **결제 기능**: 토스페이먼츠를 통한 안전한 결제 ⭐ NEW
- 👤 **프로필 관리**: 닉네임, 아바타, 자기소개 등 편집
- 🔐 **인증 시스템**: Supabase Auth를 이용한 회원가입/로그인
- 🌓 **다크 모드**: 시스템 설정에 따른 다크/라이트 모드 지원

### 좋아요 기능 상세
- ✅ 로그인한 사용자만 좋아요 가능
- ✅ 중복 좋아요 방지 (DB 레벨 제약조건)
- ✅ 실시간 좋아요 카운트 업데이트 (트리거 활용)
- ✅ 마이페이지에서 좋아요한 상품 목록 확인
- ✅ 상품 카드와 상세 페이지에 좋아요 버튼 표시
- ✅ Optimistic UI 업데이트로 빠른 사용자 경험

### 결제 기능 상세 ⭐ NEW
- ✅ 토스페이먼츠 V2 결제 위젯 연동
- ✅ 다양한 결제 수단 지원 (카드, 계좌이체, 간편결제 등)
- ✅ 안전한 서버 사이드 결제 승인
- ✅ 결제 성공/실패 페이지
- ✅ 결제 완료 후 주문 정보 자동 저장
- ✅ 결제 완료 상품 시각적 표시 (오버레이 효과)
- ✅ 결제 완료된 상품 재결제 방지
- ✅ 테스트 환경 지원

자세한 내용은 `PAYMENT_SETUP.md`를 참조하세요.

## 프로젝트 구조

```
goguma-market/
├── app/                      # Next.js App Router
│   ├── api/                  # API 라우트
│   │   └── likes/            # 좋아요 API
│   │       ├── [productId]/  # 상품별 좋아요 토글
│   │       └── user/         # 사용자 좋아요 목록
│   ├── auth/                 # 인증 콜백
│   ├── login/                # 로그인 페이지
│   ├── signup/               # 회원가입 페이지
│   ├── mypage/               # 마이페이지
│   ├── products/             # 상품 관련 페이지
│   │   ├── [id]/             # 상품 상세
│   │   └── new/              # 상품 등록
│   └── profile/              # 프로필 페이지
├── components/               # React 컴포넌트
│   ├── Header.tsx            # 헤더
│   ├── Footer.tsx            # 푸터
│   ├── ProductCard.tsx       # 상품 카드
│   ├── ProductList.tsx       # 상품 리스트
│   ├── LikeButton.tsx        # 좋아요 버튼 ⭐ NEW
│   └── ...
├── lib/                      # 유틸리티
│   ├── supabase.ts           # 서버 사이드 클라이언트
│   └── supabase-client.ts    # 클라이언트 사이드 클라이언트
├── types/                    # TypeScript 타입 정의
│   └── database.ts           # 데이터베이스 타입
└── supabase/                 # 데이터베이스 스키마
    ├── schema.sql            # 상품 테이블
    ├── profiles.sql          # 프로필 테이블
    ├── likes.sql             # 좋아요 테이블 ⭐ NEW
    ├── storage-setup.sql     # 스토리지 설정
    ├── add-user-id.sql       # 상품-사용자 연결
    ├── seed.sql              # 더미 데이터
    └── SETUP_LIKES.md        # 좋아요 기능 설정 가이드 ⭐ NEW
```

## 기술 스택

- **Next.js 15** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Supabase** - 백엔드 및 데이터베이스
  - PostgreSQL 데이터베이스
  - 인증 (Authentication)
  - 스토리지 (Storage)
  - Row Level Security (RLS)

## API 엔드포인트

### 좋아요 API

#### `GET /api/likes/[productId]`
특정 상품의 좋아요 상태 및 개수 조회
- **인증**: 선택사항 (로그인하지 않아도 호출 가능)
- **응답**: `{ liked: boolean, likeCount: number }`

#### `POST /api/likes/[productId]`
좋아요 토글 (추가/취소)
- **인증**: 필수
- **응답**: `{ liked: boolean, likeCount: number }`

#### `GET /api/likes/user`
현재 사용자가 좋아요한 상품 목록 조회
- **인증**: 필수
- **응답**: `{ products: Product[], count: number }`

## 데이터베이스 스키마

### products 테이블
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  status TEXT DEFAULT '판매중',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### likes 테이블 ⭐ NEW
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, product_id)  -- 중복 좋아요 방지
);
```

### profiles 테이블
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## 개발 가이드

### 좋아요 기능 개발 세부사항

좋아요 기능은 다음과 같은 아키텍처로 구현되었습니다:

1. **데이터베이스 레벨**
   - `likes` 테이블에 `UNIQUE(user_id, product_id)` 제약조건
   - 트리거를 통한 자동 `like_count` 업데이트
   - CASCADE 삭제로 데이터 정합성 보장

2. **API 레벨**
   - RESTful API 설계
   - Supabase RLS 정책으로 보안 강화
   - 에러 핸들링 및 유효성 검사

3. **UI/UX 레벨**
   - 클라이언트 컴포넌트로 실시간 상호작용
   - Optimistic UI 업데이트
   - 로딩 상태 및 에러 처리

자세한 내용은 `supabase/SETUP_LIKES.md`를 참조하세요.

## 배포

### Vercel 배포
1. GitHub 저장소와 연결
2. 환경 변수 설정 (Supabase URL, Key)
3. 자동 배포

### Supabase 설정
1. 프로젝트 생성
2. 데이터베이스 마이그레이션 실행
3. Storage 버킷 생성
4. RLS 정책 활성화

## 라이선스

MIT
