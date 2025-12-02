# 🚨 환경 변수 설정 필요

결제 기능을 사용하려면 `.env` 파일에 토스페이먼츠 키를 설정해야 합니다.

## 설정 방법

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase (기존 설정)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 토스페이먼츠 테스트 키
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
TOSS_SECRET_KEY=test_sk_docs_Ovk5rk1EwkEbP0W43n07xlzm
```

## 중요사항

1. **파일명**: 정확히 `.env` (앞에 점 포함)
2. **위치**: 프로젝트 루트 폴더 (package.json과 같은 위치)
3. **서버 재시작**: 환경 변수 변경 후 반드시 개발 서버 재시작
   ```bash
   # Ctrl+C로 서버 중지 후
   npm run dev
   ```

## 현재 오류

```
UNAUTHORIZED_KEY: 인증되지 않은 시크릿 키 혹은 클라이언트 키 입니다.
```

이 오류는 `.env` 파일에 토스페이먼츠 키가 설정되지 않았거나 잘못된 키를 사용했을 때 발생합니다.

## 테스트 키 정보

위의 테스트 키는 토스페이먼츠 공식 문서에서 제공하는 테스트용 키입니다.
- 실제 결제는 되지 않습니다
- 개발 및 테스트 용도로만 사용 가능
- 실제 서비스에서는 토스페이먼츠 개발자센터에서 발급받은 실제 키를 사용해야 합니다

## 확인 방법

1. 프로젝트 루트에 `.env` 파일이 있는지 확인
2. 파일 내용에 `TOSS_SECRET_KEY=` 로 시작하는 줄이 있는지 확인
3. 서버를 재시작했는지 확인

