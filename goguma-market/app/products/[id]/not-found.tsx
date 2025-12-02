import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-black">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          상품을 찾을 수 없습니다
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          요청하신 상품이 존재하지 않거나 삭제되었습니다.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

