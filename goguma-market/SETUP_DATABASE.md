# 데이터베이스 설정 가이드

이 가이드는 Supabase 데이터베이스를 처음부터 설정하는 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
4. "Create new project" 클릭

## 2. 환경 변수 설정

프로젝트 생성 후 Project Settings > API에서 다음 정보를 복사:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

프로젝트 루트에 `.env.local` 파일을 만들고 위 내용을 붙여넣으세요.

## 3. 데이터베이스 마이그레이션

Supabase 대시보드 > SQL Editor에서 다음 SQL 파일들을 **순서대로** 실행하세요:

### 3.1. 상품 테이블 생성

파일: `supabase/schema.sql`

이 스크립트는 다음을 생성합니다:
- `products` 테이블
- `updated_at` 자동 업데이트 함수 및 트리거
- 성능 최적화를 위한 인덱스
- RLS (Row Level Security) 정책

```sql
-- supabase/schema.sql 파일의 내용을 복사하여 실행
```

### 3.2. 프로필 테이블 생성

파일: `supabase/profiles.sql`

이 스크립트는 다음을 생성합니다:
- `profiles` 테이블
- 새 사용자 자동 프로필 생성 함수 및 트리거
- `avatars` 스토리지 버킷
- RLS 정책 (읽기: 모두, 쓰기: 본인만)

```sql
-- supabase/profiles.sql 파일의 내용을 복사하여 실행
```

### 3.3. 좋아요 테이블 생성 ⭐ 중요

파일: `supabase/likes.sql`

이 스크립트는 다음을 생성합니다:
- `likes` 테이블 (중복 방지 제약조건 포함)
- 좋아요 카운트 자동 업데이트 함수 및 트리거
- 성능 최적화를 위한 인덱스
- RLS 정책

```sql
-- supabase/likes.sql 파일의 내용을 복사하여 실행
```

**주의**: 이 스크립트는 반드시 `schema.sql`과 `profiles.sql` 실행 후에 실행해야 합니다.

### 3.4. 스토리지 설정

파일: `supabase/storage-setup.sql`

이 스크립트는 다음을 생성합니다:
- `products` 스토리지 버킷 (상품 이미지)
- 스토리지 RLS 정책

```sql
-- supabase/storage-setup.sql 파일의 내용을 복사하여 실행
```

### 3.5. 상품에 사용자 ID 추가

파일: `supabase/add-user-id.sql`

이 스크립트는 다음을 수행합니다:
- `products` 테이블에 `user_id` 컬럼 추가
- 외래 키 제약조건 설정
- RLS 정책 업데이트

```sql
-- supabase/add-user-id.sql 파일의 내용을 복사하여 실행
```

### 3.6. 더미 데이터 삽입 (선택사항)

파일: `supabase/seed.sql`

테스트용 더미 데이터를 삽입합니다.

```sql
-- supabase/seed.sql 파일의 내용을 복사하여 실행
```

## 4. 데이터베이스 확인

모든 SQL을 실행한 후 다음을 확인하세요:

### 테이블 확인
Supabase 대시보드 > Table Editor에서 다음 테이블이 생성되었는지 확인:
- ✅ `products` - 상품 정보
- ✅ `profiles` - 사용자 프로필
- ✅ `likes` - 좋아요 정보

### 스토리지 확인
Supabase 대시보드 > Storage에서 다음 버킷이 생성되었는지 확인:
- ✅ `avatars` - 프로필 이미지
- ✅ `products` - 상품 이미지

### RLS 정책 확인
각 테이블의 RLS가 활성화되어 있는지 확인:
- Table Editor > 테이블 선택 > "View policies"

## 5. 인증 설정 (선택사항)

### 이메일 인증 비활성화 (개발용)
개발 중 빠른 테스트를 위해 이메일 인증을 비활성화할 수 있습니다:

1. Supabase 대시보드 > Authentication > Settings
2. "Enable email confirmations" 토글 OFF

**주의**: 프로덕션에서는 반드시 이메일 인증을 활성화하세요.

### 소셜 로그인 설정 (선택사항)
Google, GitHub 등의 소셜 로그인을 추가하려면:

1. Supabase 대시보드 > Authentication > Providers
2. 원하는 프로바이더 선택 및 설정

## 6. 테스트

### 6.1. 회원가입
```
http://localhost:3000/signup
```
새 계정을 만들어 프로필이 자동으로 생성되는지 확인하세요.

### 6.2. 상품 등록
```
http://localhost:3000/products/new
```
로그인 후 상품을 등록해보세요.

### 6.3. 좋아요 테스트
1. 홈 페이지에서 상품 카드의 하트 버튼 클릭
2. 좋아요 카운트가 증가하는지 확인
3. 다시 클릭하여 좋아요 취소 확인
4. 마이페이지 > 좋아요 탭에서 좋아요한 상품 목록 확인

## 7. 트러블슈팅

### 문제: "relation does not exist" 에러
**원인**: SQL 파일 실행 순서가 잘못되었거나 일부 스크립트가 실행되지 않음  
**해결**: 3번 단계의 순서대로 모든 SQL 파일을 다시 실행

### 문제: 좋아요 버튼 클릭 시 401 에러
**원인**: 로그인하지 않음  
**해결**: 회원가입 또는 로그인 후 다시 시도

### 문제: 좋아요 카운트가 업데이트되지 않음
**원인**: 트리거가 제대로 생성되지 않음  
**해결**: `supabase/likes.sql`의 트리거 부분을 다시 실행

### 문제: 이미지 업로드 실패
**원인**: 스토리지 정책이 제대로 설정되지 않음  
**해결**: `supabase/storage-setup.sql`을 다시 실행하고 버킷이 public으로 설정되었는지 확인

### 문제: RLS 정책 위반 에러
**원인**: RLS 정책이 너무 제한적이거나 잘못 설정됨  
**해결**: 
1. Table Editor에서 해당 테이블의 정책 확인
2. 필요시 SQL 파일의 RLS 정책 부분만 다시 실행

## 8. 유용한 SQL 쿼리

### 모든 좋아요 데이터 확인
```sql
SELECT 
  l.id,
  l.created_at,
  p.title as product_title,
  pr.nickname as user_nickname
FROM likes l
JOIN products p ON l.product_id = p.id
JOIN profiles pr ON l.user_id = pr.id
ORDER BY l.created_at DESC;
```

### 상품별 좋아요 수 확인
```sql
SELECT 
  p.title,
  p.like_count,
  COUNT(l.id) as actual_likes
FROM products p
LEFT JOIN likes l ON p.id = l.product_id
GROUP BY p.id, p.title, p.like_count
ORDER BY p.like_count DESC;
```

### 사용자별 좋아요 수 확인
```sql
SELECT 
  pr.nickname,
  COUNT(l.id) as total_likes
FROM profiles pr
LEFT JOIN likes l ON pr.id = l.user_id
GROUP BY pr.id, pr.nickname
ORDER BY total_likes DESC;
```

### 좋아요 카운트 재동기화 (문제 발생 시)
```sql
UPDATE products
SET like_count = (
  SELECT COUNT(*)
  FROM likes
  WHERE likes.product_id = products.id
);
```

## 9. 다음 단계

데이터베이스 설정이 완료되었다면:

1. ✅ 애플리케이션 실행: `npm run dev`
2. ✅ 회원가입 및 로그인 테스트
3. ✅ 상품 등록 테스트
4. ✅ 좋아요 기능 테스트
5. ✅ 프로필 수정 테스트

모든 기능이 정상 작동한다면 설정이 완료된 것입니다! 🎉

## 10. 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [좋아요 기능 상세 가이드](./supabase/SETUP_LIKES.md)
- [Next.js 공식 문서](https://nextjs.org/docs)


