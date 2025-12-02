'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string;
    orderName: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      const productId = searchParams.get('productId');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setIsConfirming(false);
        return;
      }

      try {
        // 서버에 결제 승인 요청
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            productId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || '결제 승인에 실패했습니다.');
        }

        // 결제 성공
        setPaymentInfo({
          orderId: data.data.orderId,
          orderName: data.data.orderName,
          amount: data.data.totalAmount,
        });
        setIsConfirming(false);
      } catch (err) {
        console.error('결제 승인 에러:', err);
        setError(err instanceof Error ? err.message : '결제 승인 중 오류가 발생했습니다.');
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
              <div className="mb-4 text-2xl">⏳</div>
              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                결제를 확인하는 중입니다...
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                잠시만 기다려주세요.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-900">
              <div className="mb-4 text-center text-4xl">❌</div>
              <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                결제 실패
              </h1>
              <p className="mb-6 text-center text-red-600 dark:text-red-400">
                {error}
              </p>
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="flex-1 rounded-lg bg-gray-200 py-3 text-center font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  홈으로
                </Link>
                <button
                  onClick={() => router.back()}
                  className="flex-1 rounded-lg bg-orange-600 py-3 font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-900">
            <div className="mb-4 text-center text-4xl">✅</div>
            <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
              결제가 완료되었습니다!
            </h1>
            
            {paymentInfo && (
              <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">주문번호</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {paymentInfo.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">상품명</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {paymentInfo.orderName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">결제 금액</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {paymentInfo.amount.toLocaleString('ko-KR')}원
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full rounded-lg bg-orange-600 py-3 text-center font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                홈으로 돌아가기
              </Link>
              <Link
                href="/mypage"
                className="block w-full rounded-lg bg-gray-200 py-3 text-center font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                마이페이지
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}

