/**
 * Tailwind CSS 설정 예시
 * 
 * 참고: 이 프로젝트는 Tailwind CSS v4를 사용하며,
 * 실제 설정은 app/globals.css의 @theme 인라인 블록에서 관리됩니다.
 * 
 * 이 파일은 참고용 예시입니다.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        secondary: {
          50: '#FDF4FF',
          100: '#FAE8FF',
          200: '#F5D0FE',
          300: '#F0ABFC',
          400: '#E879F9',
          500: '#D946EF',
          600: '#C026D3',
          700: '#A21CAF',
          800: '#86198F',
          900: '#701A75',
          950: '#4A044E',
        },
        accent: {
          50: '#FEF3C7',
          100: '#FDE68A',
          200: '#FCD34D',
          300: '#FBBF24',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
          950: '#292524',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif',
        ],
        mono: [
          'Fira Code',
          'Consolas',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700', letterSpacing: '-0.025em' }],
        'h2': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.025em' }],
        'h3': ['1.5rem', { lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.025em' }],
        'h4': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.025em' }],
        'h5': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.025em' }],
        'h6': ['1rem', { lineHeight: '1.5rem', fontWeight: '600', letterSpacing: '-0.025em' }],
        'body': ['1rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};

export default config;

