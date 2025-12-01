This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Supabase 설정

이 앱은 Supabase를 사용하여 데이터를 저장합니다. 다음 단계를 따라 설정하세요:

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성하세요.
2. 프로젝트가 생성되면, Settings > API에서 다음 정보를 확인하세요:
   - Project URL
   - anon/public key

### 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 SQL Editor를 엽니다.
2. `supabase-schema.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행하세요.
   - 이 스크립트는 `categories`와 `transactions` 테이블을 생성합니다.
   - 기본 카테고리 데이터를 삽입합니다.
   - RLS (Row Level Security) 정책을 설정합니다.

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`your_supabase_project_url`과 `your_supabase_anon_key`를 실제 Supabase 프로젝트의 값으로 교체하세요.

### 4. 개발 서버 실행

환경 변수를 설정한 후 개발 서버를 실행하세요:

```bash
npm run dev
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Vercel 배포 설정

1. **프로젝트 연결**
   - Vercel 대시보드에서 "Add New Project" 클릭
   - GitHub/GitLab/Bitbucket 저장소 연결

2. **Root Directory 설정 (중요!)**
   - 프로젝트 설정 → Settings → General
   - "Root Directory"를 `my-budget-app`으로 설정
   - 또는 프로젝트가 `my-budget-app` 폴더 안에 있다면 해당 폴더명 입력

3. **환경 변수 설정**
   - Settings → Environment Variables
   - 다음 변수 추가:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **배포**
   - 설정 저장 후 자동으로 배포 시작
   - 또는 "Deploy" 버튼 클릭

### 배포 오류 해결

만약 "No Next.js version detected" 오류가 발생하면:
- Root Directory가 `my-budget-app`으로 설정되어 있는지 확인
- `package.json` 파일이 Root Directory 안에 있는지 확인
- 프로젝트를 다시 배포

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
