# 좋아요 기능 설정 가이드

## 1. 데이터베이스 마이그레이션

Supabase 대시보드에서 다음 SQL 파일을 순서대로 실행하세요:

### 1) likes 테이블 생성
`supabase/likes.sql` 파일의 SQL을 실행하세요.

이 파일은 다음을 수행합니다:
- `likes` 테이블 생성 (user_id, product_id의 unique 조합)
- 성능 최적화를 위한 인덱스 생성
- RLS (Row Level Security) 정책 설정
- 좋아요 추가/삭제시 자동으로 `products.like_count` 업데이트하는 트리거
- 기존 데이터 동기화

## 2. 테이블 구조

### likes 테이블
```sql
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### 주요 특징:
- **중복 방지**: `UNIQUE(user_id, product_id)` 제약조건으로 한 사용자가 같은 상품에 중복 좋아요 불가
- **CASCADE 삭제**: 사용자나 상품이 삭제되면 관련 좋아요도 자동 삭제
- **자동 카운트 업데이트**: 트리거를 통해 `products.like_count`가 자동으로 동기화

## 3. RLS 정책

- **읽기**: 모든 사용자가 좋아요 정보를 읽을 수 있음
- **생성**: 로그인한 사용자만 자신의 좋아요를 추가할 수 있음
- **삭제**: 사용자는 자신의 좋아요만 삭제할 수 있음

## 4. API 엔드포인트

### GET `/api/likes/[productId]`
- 해당 상품의 좋아요 상태 및 총 개수 조회
- 로그인하지 않아도 호출 가능
- 응답: `{ liked: boolean, likeCount: number }`

### POST `/api/likes/[productId]`
- 좋아요 토글 (추가/취소)
- 로그인 필요 (401 에러)
- 응답: `{ liked: boolean, likeCount: number }`

## 5. 컴포넌트 사용법

### LikeButton 컴포넌트
```tsx
<LikeButton
  productId={product.id}
  initialLikeCount={product.like_count}
  variant="card" // 또는 "detail"
  className="custom-class" // 선택사항
/>
```

#### Props:
- `productId`: 상품 ID (필수)
- `initialLikeCount`: 초기 좋아요 수 (선택, 기본값: 0)
- `variant`: 버튼 스타일 - "card" (작은 버튼) 또는 "detail" (큰 버튼)
- `className`: 추가 CSS 클래스 (선택)

#### 특징:
- 로그인하지 않은 사용자가 클릭하면 로그인 페이지로 이동
- Optimistic UI 업데이트로 빠른 응답
- 자동으로 현재 사용자의 좋아요 상태를 확인

## 6. 사용 위치

### ProductCard (상품 카드)
- 이미지 우측 하단에 작은 좋아요 버튼 표시
- `variant="card"` 사용

### 상품 상세 페이지
- 상품 정보 아래에 큰 좋아요 버튼 표시
- `variant="detail"` 사용

## 7. 데이터 흐름

1. 사용자가 좋아요 버튼 클릭
2. 로그인 확인
3. API 호출 (`POST /api/likes/[productId]`)
4. DB에서 기존 좋아요 확인
5. 좋아요 추가 또는 삭제
6. 트리거가 자동으로 `products.like_count` 업데이트
7. 업데이트된 데이터 반환
8. UI 업데이트 및 페이지 리프레시

## 8. 성능 최적화

- **인덱스**: user_id, product_id, (user_id, product_id) 조합에 인덱스 생성
- **트리거**: like_count를 별도로 계산하지 않고 자동 업데이트
- **RLS**: Row Level Security로 보안 강화
- **Optimistic UI**: 사용자 경험 향상을 위한 즉각적인 UI 업데이트

## 9. 에러 처리

- 로그인하지 않은 사용자 → 로그인 페이지로 리다이렉트
- 존재하지 않는 상품 → 404 에러
- 네트워크 오류 → 사용자에게 알림 표시
- DB 에러 → 콘솔에 로그, 500 에러 반환

## 10. 테스트 체크리스트

- [ ] 로그인한 사용자가 좋아요를 추가할 수 있는가?
- [ ] 좋아요를 취소할 수 있는가?
- [ ] 좋아요 수가 올바르게 표시되는가?
- [ ] 로그인하지 않은 사용자가 클릭하면 로그인 페이지로 이동하는가?
- [ ] 여러 사용자가 동시에 좋아요해도 카운트가 정확한가?
- [ ] 상품이 삭제되면 관련 좋아요도 삭제되는가?
- [ ] 사용자가 탈퇴하면 관련 좋아요도 삭제되는가?
- [ ] 한 사용자가 같은 상품에 중복 좋아요할 수 없는가?

