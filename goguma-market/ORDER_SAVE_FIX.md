# 주문 정보 저장 안 되는 문제 해결

결제는 성공했지만 orders 테이블에 데이터가 저장되지 않는 문제 해결 방법입니다.

## 해결 방법

### 1. Supabase에서 RLS 정책 업데이트

Supabase SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;

-- 새 정책 생성 (서버에서 무조건 삽입 가능)
CREATE POLICY "Service role can create orders" ON orders
  FOR INSERT
  WITH CHECK (true);
```

### 2. 환경 변수 확인

`.env` 파일에 다음 내용이 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key
```

### 3. 서버 재시작

```bash
# Ctrl+C로 서버 중지
npm run dev
```

### 4. 테스트

1. 상품 상세 페이지 접속
2. "결제하기" 클릭
3. 테스트 결제 진행
4. 터미널 로그 확인:
   ```
   📦 주문 정보 저장 시작...
   ✅ 주문 정보 저장 성공
   ```

### 5. DB 확인

Supabase Table Editor에서 `orders` 테이블을 확인하여 데이터가 저장되었는지 확인하세요.

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
```

## 여전히 안 될 경우

### Option A: Service Role Key 추가 (권장)

Supabase 대시보드에서 Service Role Key를 복사하여 `.env`에 추가:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Service Role Key는 RLS를 우회할 수 있어 서버에서 확실하게 데이터를 삽입할 수 있습니다.

### Option B: RLS 완전 비활성화 (테스트용)

**주의: 보안상 권장하지 않음. 테스트 목적으로만 사용**

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

## 로그 확인 방법

터미널에서 다음 로그를 찾으세요:

✅ **성공:**
```
📦 주문 정보 저장 시작...
저장할 주문 데이터: { ... }
✅ 주문 정보 저장 성공: [ {...} ]
```

❌ **실패:**
```
📦 주문 정보 저장 시작...
❌ 주문 정보 저장 실패: { ... }
```

실패 시 오류 메시지를 확인하면 정확한 원인을 알 수 있습니다.

