import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-black/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
          >
            <span className="text-2xl">🍠</span>
            <span className="hidden sm:inline">고구마마켓</span>
          </Link>

          {/* 인증 버튼 (로그인/회원가입 또는 로그아웃) */}
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

