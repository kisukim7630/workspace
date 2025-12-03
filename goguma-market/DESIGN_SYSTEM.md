# 🎨 고구마 마켓 디자인 시스템

## 컬러 팔레트

### Primary (주황색 계열 - 고구마 컨셉)
따뜻하고 친근한 느낌의 주황색 계열로, 고구마의 따뜻한 색감을 모티브로 했습니다.

| 색상 | HEX | 용도 |
|------|-----|------|
| Primary 50 | `#FFF7ED` | 배경, 호버 상태 |
| Primary 100 | `#FFEDD5` | 연한 배경 |
| Primary 200 | `#FED7AA` | 경계선, 구분선 |
| Primary 300 | `#FDBA74` | 부드러운 강조 |
| Primary 400 | `#FB923C` | 보조 버튼 |
| **Primary 500** | `#F97316` | **메인 컬러 (버튼, 링크)** |
| Primary 600 | `#EA580C` | 호버 상태 |
| Primary 700 | `#C2410C` | 활성 상태 |
| Primary 800 | `#9A3412` | 텍스트 강조 |
| Primary 900 | `#7C2D12` | 다크 모드 텍스트 |
| Primary 950 | `#431407` | 다크 모드 배경 |

### Secondary (보라색 계열)
보조 컬러로, 특별한 기능이나 강조가 필요한 부분에 사용합니다.

| 색상 | HEX | 용도 |
|------|-----|------|
| Secondary 50 | `#FDF4FF` | 연한 배경 |
| Secondary 100 | `#FAE8FF` | 부드러운 강조 |
| Secondary 200 | `#F5D0FE` | 경계선 |
| Secondary 300 | `#F0ABFC` | 보조 요소 |
| **Secondary 500** | `#D946EF` | **보조 버튼, 특별 기능** |
| Secondary 700 | `#A21CAF` | 호버 상태 |
| Secondary 900 | `#701A75` | 텍스트 강조 |

### Accent (노란색 계열)
강조나 경고, 알림 등에 사용하는 포인트 컬러입니다.

| 색상 | HEX | 용도 |
|------|-----|------|
| Accent 50 | `#FEF3C7` | 경고 배경 |
| Accent 100 | `#FDE68A` | 연한 경고 |
| **Accent 500** | `#D97706` | **경고, 알림** |
| Accent 700 | `#92400E` | 강한 경고 |

### Grayscale
텍스트, 배경, 경계선 등에 사용하는 회색 계열입니다.

| 색상 | HEX | 용도 |
|------|-----|------|
| Gray 50 | `#FAFAFA` | 배경 (라이트 모드) |
| Gray 100 | `#F5F5F5` | 카드 배경 |
| Gray 200 | `#E5E5E5` | 경계선 |
| Gray 300 | `#D4D4D4` | 비활성 요소 |
| Gray 400 | `#A3A3A3` | 플레이스홀더 |
| Gray 500 | `#737373` | 보조 텍스트 |
| Gray 600 | `#525252` | 본문 텍스트 |
| Gray 700 | `#404040` | 강조 텍스트 |
| Gray 800 | `#262626` | 다크 모드 배경 |
| Gray 900 | `#171717` | 다크 모드 텍스트 |
| Gray 950 | `#0A0A0A` | 다크 모드 배경 (진한) |

## 타이포그래피

### 폰트 패밀리

**Sans (본문용)**
```
Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 
Helvetica Neue, Segoe UI, Apple SD Gothic Neo, Noto Sans KR, 
Malgun Gothic, sans-serif
```

**Mono (코드용)**
```
Fira Code, Consolas, Monaco, Courier New, monospace
```

### Heading (제목)

| 레벨 | 크기 | 줄 높이 | 굵기 | 자간 | 용도 |
|------|------|---------|------|------|------|
| H1 | 2.25rem (36px) | 2.5rem (40px) | 700 | -0.025em | 페이지 제목 |
| H2 | 1.875rem (30px) | 2.25rem (36px) | 700 | -0.025em | 섹션 제목 |
| H3 | 1.5rem (24px) | 2rem (32px) | 600 | -0.025em | 하위 섹션 |
| H4 | 1.25rem (20px) | 1.75rem (28px) | 600 | -0.025em | 카드 제목 |
| H5 | 1.125rem (18px) | 1.75rem (28px) | 600 | -0.025em | 작은 제목 |
| H6 | 1rem (16px) | 1.5rem (24px) | 600 | -0.025em | 최소 제목 |

### Body (본문)

- **폰트 패밀리**: Sans
- **크기**: 1rem (16px)
- **줄 높이**: 1.75rem (28px)
- **굵기**: 400 (Regular)

### Caption (설명, 캡션)

- **폰트 패밀리**: Sans
- **크기**: 0.875rem (14px)
- **줄 높이**: 1.25rem (20px)
- **굵기**: 400 (Regular)

## 사용 예시

### Tailwind CSS 클래스

```tsx
// Primary 컬러 사용
<button className="bg-primary-500 text-white hover:bg-primary-600">
  버튼
</button>

// Heading 사용
<h1 className="text-h1 font-bold">페이지 제목</h1>
<h2 className="text-h2 font-bold">섹션 제목</h2>

// Body 텍스트
<p className="text-body">본문 텍스트입니다.</p>

// Caption 텍스트
<span className="text-caption text-gray-500">설명 텍스트</span>
```

### CSS 변수 사용

```css
.custom-button {
  background-color: var(--color-primary-500);
  color: white;
}

.custom-heading {
  font-family: var(--font-sans);
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 2.5rem;
  letter-spacing: -0.025em;
}
```

## 디자인 원칙

1. **친근함**: 따뜻한 주황색 계열로 친근한 느낌 전달
2. **가독성**: 충분한 대비와 적절한 줄 높이로 가독성 확보
3. **일관성**: 일관된 색상과 타이포그래피로 통일감 유지
4. **접근성**: WCAG 2.1 AA 기준 준수 (색상 대비 4.5:1 이상)

## 다크 모드 지원

모든 컬러는 다크 모드에서도 적절한 대비를 유지하도록 설계되었습니다.

```tsx
// 다크 모드 자동 대응
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  컨텐츠
</div>
```

