'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';
const customerKey = 'goguma-market-customer'; // 실제 서비스에서는 사용자별 고유 키 사용

interface PaymentPageProps {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<{
    price: string;
    title: string;
  }>;
}

export default function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const router = useRouter();
  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  
  const [productId, setProductId] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>('');

  // 1단계: 파라미터 로드
  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;
      
      setProductId(resolvedParams.productId);
      setPrice(Number(resolvedSearchParams.price) || 0);
      setTitle(resolvedSearchParams.title || '상품');
      setIsLoading(false); // 파라미터 로드 완료
    };

    initParams();
  }, [params, searchParams]);

  // 2단계: DOM 렌더링 후 위젯 초기화
  useEffect(() => {
    if (isLoading || !productId || !price || isReady) return;

    const initializePaymentWidget = async () => {
      try {
        // 클라이언트 키 확인
        if (!clientKey) {
          throw new Error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
        }

        console.log('토스페이먼츠 초기화 시작...');
        console.log('클라이언트 키:', clientKey.substring(0, 20) + '...');
        
        // DOM 요소가 완전히 렌더링될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // DOM 요소 존재 확인
        const paymentMethodElement = document.querySelector('#payment-method');
        const agreementElement = document.querySelector('#agreement');
        
        if (!paymentMethodElement) {
          console.error('payment-method 요소를 찾을 수 없습니다.');
          throw new Error('결제 수단 컨테이너를 찾을 수 없습니다.');
        }
        if (!agreementElement) {
          console.error('agreement 요소를 찾을 수 없습니다.');
          throw new Error('약관 컨테이너를 찾을 수 없습니다.');
        }
        
        console.log('DOM 요소 확인 완료');
        
        const tossPayments = await loadTossPayments(clientKey);
        console.log('토스페이먼츠 로드 완료');
        
        // 결제 위젯 생성
        const paymentWidget = tossPayments.widgets({ customerKey });
        console.log('위젯 생성 완료');
        
        paymentWidgetRef.current = paymentWidget;

        // 결제 수단 위젯 렌더링
        await paymentWidget.setAmount({
          currency: 'KRW',
          value: price,
        });
        console.log('금액 설정 완료:', price);

        await paymentWidget.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        });
        console.log('결제 수단 렌더링 완료');

        // 이용약관 위젯 렌더링
        await paymentWidget.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        });
        console.log('약관 렌더링 완료');

        setIsReady(true);
      } catch (err) {
        console.error('결제 위젯 초기화 실패:', err);
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(`결제 위젯을 불러오는데 실패했습니다. ${errorMessage}`);
      }
    };

    initializePaymentWidget();
  }, [isLoading, productId, price, isReady]);

  const handlePayment = async () => {
    if (!paymentWidgetRef.current) {
      alert('결제 위젯이 준비되지 않았습니다.');
      return;
    }

    try {
      // 주문 ID 생성 (타임스탬프 + 랜덤)
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      // 결제 요청
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: title,
        successUrl: `${window.location.origin}/payment/success?productId=${productId}`,
        failUrl: `${window.location.origin}/payment/fail?productId=${productId}`,
        customerEmail: 'customer@example.com', // 실제 서비스에서는 로그인한 사용자 이메일 사용
        customerName: '고구마', // 실제 서비스에서는 로그인한 사용자 이름 사용
      });
    } catch (err) {
      console.error('결제 요청 실패:', err);
      alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (isLoading || !productId || !price) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
              <div className="text-gray-600 dark:text-gray-400">
                결제 정보를 불러오는 중...
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
              <div className="mb-4 text-center text-red-600 dark:text-red-400">
                {error}
              </div>
              <button
                onClick={() => router.back()}
                className="w-full rounded-lg bg-gray-200 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                돌아가기
              </button>
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
          {/* 결제 정보 */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              결제하기
            </h1>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">상품명</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">결제 금액</span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {price.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>
          </div>

          {/* 결제 수단 선택 */}
          <div className="mb-6">
            <div id="payment-method">
              {!isReady && (
                <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900">
                  <div className="text-gray-600 dark:text-gray-400">
                    결제 위젯을 불러오는 중...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 이용약관 동의 */}
          <div className="mb-6">
            <div id="agreement"></div>
          </div>

          {/* 결제하기 버튼 */}
          <button
            onClick={handlePayment}
            disabled={!isReady}
            className={`w-full rounded-lg py-4 text-lg font-bold text-white transition-colors ${
              isReady
                ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600'
                : 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
            }`}
          >
            {isReady ? '결제하기' : '준비 중...'}
          </button>

          {/* 취소 버튼 */}
          <button
            onClick={() => router.back()}
            className="mt-3 w-full rounded-lg bg-gray-200 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

