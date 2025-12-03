/**
 * Design System Theme Tokens
 * 
 * Color palette and typography definitions for the 식당 예약 및 대기 관리 플랫폼.
 * Compatible with Tailwind CSS and shadcn/ui.
 */

export const theme = {
  colors: {
    primary: {
      value: '#FF6B35',
      usage: 'Primary actions, buttons, links, and key interactive elements',
    },
    secondary: {
      value: '#F7931E',
      usage: 'Secondary actions, highlights, and supporting elements',
    },
    accent: {
      value: '#4ECDC4',
      usage: 'Accent elements, notifications, and special highlights',
    },
    grayscale: {
      100: '#f7fafc',
      200: '#edf2f7',
      300: '#e2e8f0',
      400: '#cbd5e0',
      500: '#a0aec0',
      600: '#718096',
      700: '#4a5568',
      800: '#2d3748',
      900: '#1a202c',
    },
  },
  typography: {
    fontFamily: {
      sans: "'Inter', sans-serif",
    },
    headings: {
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
  },
} as const;

export type Theme = typeof theme;

