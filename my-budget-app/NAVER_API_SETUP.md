# 네이버 뉴스 API 설정 가이드

## 📋 필요한 설정

네이버 뉴스 검색 기능을 사용하려면 네이버 개발자 센터에서 API 키를 발급받아야 합니다.

## 🔑 API 키 발급 방법

1. **네이버 개발자 센터 접속**
   - https://developers.naver.com/main/ 접속
   - 네이버 계정으로 로그인

2. **애플리케이션 등록**
   - "Application" → "애플리케이션 등록" 클릭
   - 애플리케이션 이름 입력 (예: "내 가계부 앱")
   - 사용 API 선택: **"검색"** 선택
   - 서비스 환경: **"Web"** 선택
   - 로그인 오픈 API 서비스 환경: 필요 없음 (선택 안 함)

3. **API 키 확인**
   - 등록 후 "Client ID"와 "Client Secret" 확인

## ⚙️ 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
```

## 📝 예시

```env
NAVER_CLIENT_ID=abc123def456ghi789
NAVER_CLIENT_SECRET=xyz789uvw456rst123
```

## ⚠️ 주의사항

1. **`.env.local` 파일은 절대 Git에 커밋하지 마세요!**
   - `.gitignore`에 이미 포함되어 있어야 합니다.

2. **API 사용량 제한**
   - 무료: 일일 25,000건
   - 초당 최대 10건

3. **보안**
   - Client Secret은 절대 클라이언트 사이드에 노출되지 않도록 주의하세요.
   - 현재 구현은 서버 사이드(API Route)에서만 사용하므로 안전합니다.

## 🚀 사용 방법

1. 환경 변수 설정 완료 후 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `/news` 페이지 접속

3. 검색어 입력 후 뉴스 검색

## 🔍 지원 기능

- ✅ 뉴스 검색
- ✅ 페이지네이션
- ✅ 빠른 검색 버튼 (경제, IT, 정치, 사회, 스포츠, 연예)
- ✅ 날짜 및 출처 표시
- ✅ 원문 링크

## 📚 참고 자료

- [네이버 검색 API 문서](https://developers.naver.com/docs/serviceapi/search/news/news.md)
- [네이버 개발자 센터](https://developers.naver.com/)

