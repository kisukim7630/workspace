# 토스페이먼츠 결제 연동 가이드

## 개요

이 프로젝트는 토스페이먼츠 V2 결제 위젯을 사용하여 상품 결제 기능을 구현했습니다.

## 설정 방법

### 1. 토스페이먼츠 가입 및 API 키 발급

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)에 가입합니다.
2. 대시보드에서 클라이언트 키와 시크릿 키를 발급받습니다.

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 추가하세요:

```bash
# Supabase (기존 설정 유지)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 토스페이먼츠
# 클라이언트 키 (공개 가능)
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key

# 시크릿 키 (서버에서만 사용, 절대 공개 금지)
TOSS_SECRET_KEY=your_toss_secret_key
```

**테스트용 키 (개발 중에만 사용):**
```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
TOSS_SECRET_KEY=test_sk_docs_Ovk5rk1EwkEbP0W43n07xlzm
```

⚠️ **주의:** 실제 서비스에서는 반드시 실제 발급받은 키를 사용해야 합니다!

### 3. 패키지 설치

```bash
npm install
```

토스페이먼츠 SDK는 이미 설치되어 있습니다:
- `@tosspayments/tosspayments-sdk`

## 사용 방법

### 결제 플로우

1. **상품 선택**: 사용자가 상품 상세 페이지에서 "결제하기" 버튼 클릭
2. **결제 페이지**: `/payment/[productId]` 페이지로 이동하여 결제 수단 선택
3. **결제 승인**: 결제 성공 시 `/api/payment/confirm`로 결제 승인 요청
4. **결제 완료**: `/payment/success` 페이지에서 결제 완료 확인

### 주요 파일 구조

```
app/
├── api/
│   └── payment/
│       └── confirm/
│           └── route.ts          # 결제 승인 API
├── payment/
│   ├── [productId]/
│   │   └── page.tsx             # 결제 페이지
│   ├── success/
│   │   └── page.tsx             # 결제 성공 페이지
│   └── fail/
│       └── page.tsx             # 결제 실패 페이지
└── products/
    └── [id]/
        └── page.tsx             # 상품 상세 페이지 (결제 버튼 포함)

types/
└── database.ts                  # 결제 관련 타입 정의
```

## 결제 기능 상세

### 결제 위젯 초기화

결제 페이지(`app/payment/[productId]/page.tsx`)에서 토스페이먼츠 위젯을 초기화합니다:

```typescript
const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
```

### 결제 수단 렌더링

```typescript
paymentWidget.renderPaymentMethods(
  '#payment-method',
  { value: price },
  { variantKey: 'DEFAULT' }
);
```

### 결제 요청

```typescript
await paymentWidget.requestPayment({
  orderId: '주문번호',
  orderName: '상품명',
  successUrl: '성공 URL',
  failUrl: '실패 URL',
  customerEmail: '이메일',
  customerName: '이름',
});
```

### 결제 승인

서버 측에서 결제를 승인합니다(`app/api/payment/confirm/route.ts`):

```typescript
const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    paymentKey,
    orderId,
    amount,
  }),
});
```

## 테스트 카드 정보

토스페이먼츠 테스트 환경에서 사용할 수 있는 카드 정보:

- **카드번호**: 아무 16자리 숫자
- **유효기간**: 미래의 아무 날짜
- **CVC**: 아무 3자리 숫자
- **비밀번호**: 아무 2자리 숫자

## 보안 고려사항

1. **시크릿 키 보호**: `TOSS_SECRET_KEY`는 절대 클라이언트에 노출되어서는 안 됩니다.
2. **환경 변수**: `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
3. **결제 승인**: 결제 승인은 반드시 서버 측에서 처리되어야 합니다.
4. **금액 검증**: 서버에서 결제 금액을 검증하여 위변조를 방지합니다.

## 주문 관리 기능 ✅ 구현 완료

### 주문 테이블 설정

`supabase/orders.sql` 파일을 Supabase SQL Editor에서 실행하세요:

```bash
# 주문 테이블 생성
# - 결제 완료 시 자동으로 주문 정보 저장
# - 결제 완료된 상품은 자동으로 '판매완료' 상태로 변경
```

### 구현된 기능

1. ✅ **주문 정보 자동 저장**: 결제 성공 시 데이터베이스에 주문 정보 자동 저장
2. ✅ **결제 상태 표시**: 상품 상세 페이지에서 결제 완료 여부 확인
3. ✅ **시각적 오버레이**: 결제 완료된 상품은 회색 반투명 오버레이로 표시
4. ✅ **재결제 방지**: 결제 완료된 상품은 결제 버튼이 비활성화됨
5. ✅ **상품 상태 자동 업데이트**: 결제 완료 시 상품 상태가 '판매완료'로 자동 변경

### 주문 테이블 구조

```sql
orders (
  id: UUID
  order_id: TEXT (토스페이먼츠 주문 ID)
  payment_key: TEXT (토스페이먼츠 결제 키)
  user_id: UUID (구매자)
  product_id: UUID (상품)
  order_name: TEXT (주문명)
  amount: INTEGER (결제 금액)
  status: TEXT (결제 상태)
  method: TEXT (결제 수단)
  approved_at: TIMESTAMP (승인 시간)
  customer_name: TEXT (고객명)
  customer_email: TEXT (고객 이메일)
)
```

## 추가 개선 사항 (선택사항)

1. ✅ **주문 데이터베이스**: 구현 완료
2. **사용자 정보**: 로그인한 사용자의 실제 정보를 사용하여 결제
3. **웹훅**: 결제 상태 변경 시 서버에 알림 받기
4. **환불 기능**: 결제 취소/환불 API 구현
5. **주문 목록**: 마이페이지에서 주문 내역 확인

## 참고 문서

- [토스페이먼츠 V2 결제위젯 연동 가이드](https://docs.tosspayments.com/guides/v2/payment-widget/integration)
- [토스페이먼츠 API 레퍼런스](https://docs.tosspayments.com/reference)
- [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)

## 문제 해결

### 결제 위젯이 로드되지 않을 때
- 클라이언트 키가 올바른지 확인하세요.
- 네트워크 연결을 확인하세요.
- 브라우저 콘솔에서 에러 메시지를 확인하세요.

### 결제 승인이 실패할 때
- 시크릿 키가 올바른지 확인하세요.
- 결제 금액이 일치하는지 확인하세요.
- 서버 로그에서 에러 메시지를 확인하세요.

### 테스트 결제가 안 될 때
- 테스트 키를 사용하고 있는지 확인하세요.
- 결제 금액이 0원보다 큰지 확인하세요.

