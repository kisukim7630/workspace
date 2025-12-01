import Link from 'next/link';

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

          {/* 로그인/회원가입 버튼 */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 sm:px-5"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 sm:px-5"
            >
              회원가입
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

