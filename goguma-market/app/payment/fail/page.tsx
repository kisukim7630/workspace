'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const productId = searchParams.get('productId');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-900">
            <div className="mb-4 text-center text-4xl">❌</div>
            <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
              결제에 실패했습니다
            </h1>
            
            <div className="mb-6 space-y-2 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              {code && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">오류 코드</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {code}
                  </span>
                </div>
              )}
              {message && (
                <div>
                  <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">오류 메시지</div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {decodeURIComponent(message)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {productId && (
                <Link
                  href={`/products/${productId}`}
                  className="block w-full rounded-lg bg-orange-600 py-3 text-center font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                >
                  상품 페이지로 돌아가기
                </Link>
              )}
              <Link
                href="/"
                className="block w-full rounded-lg bg-gray-200 py-3 text-center font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
              <div className="text-gray-600 dark:text-gray-400">
                로딩 중...
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <FailContent />
    </Suspense>
  );
}


