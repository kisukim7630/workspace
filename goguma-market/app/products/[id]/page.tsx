import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { Product } from '@/components/ProductCard';
import ProductActions from '@/components/ProductActions';
import LikeButton from '@/components/LikeButton';
import { Order } from '@/types/database';

interface Profile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('상품 조회 실패:', error);
    return null;
  }
}

async function getSellerProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('프로필 조회 실패:', error);
    return null;
  }
}

async function getProductOrder(productId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'DONE')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('주문 조회 실패:', error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const sellerProfile = product.user_id
    ? await getSellerProfile(product.user_id)
    : null;

  // 결제 완료 여부 확인
  const order = await getProductOrder(id);
  const isPaid = !!order;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status?: string) => {
    const colors = {
      판매중: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      예약중: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      판매완료: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };

    return colors[status as keyof typeof colors] || colors['판매중'];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900">
            {/* 결제 완료 오버레이 */}
            {isPaid && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
                <div className="rounded-lg bg-white px-8 py-6 text-center shadow-xl dark:bg-gray-800">
                  <div className="mb-4 text-6xl">✅</div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    결제 완료
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    이 상품은 이미 판매가 완료되었습니다
                  </p>
                  {order && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                      결제일: {new Date(order.approved_at || order.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 이미지 */}
            <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 sm:aspect-video">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* 상품 정보 */}
            <div className="p-6 sm:p-8">
              {/* 상태 배지 */}
              <div className="mb-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(product.status)}`}
                >
                  {product.status || '판매중'}
                </span>
              </div>

              {/* 제목 */}
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                {product.title}
              </h1>

              {/* 가격 */}
              <div className="mb-4 text-3xl font-bold text-orange-600 dark:text-orange-400">
                {formatPrice(product.price)}원
              </div>

              {/* 구분선 */}
              <hr className="my-6 border-gray-200 dark:border-gray-800" />

              {/* 상세 정보 */}
              <div className="space-y-4">
                {/* 판매자 정보 */}
                {sellerProfile && (
                  <div className="flex items-start">
                    <span className="w-24 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                      판매자
                    </span>
                    <Link
                      href={`/profile/${sellerProfile.id}`}
                      className="flex items-center gap-2 text-sm text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        {sellerProfile.avatar_url ? (
                          <Image
                            src={sellerProfile.avatar_url}
                            alt={sellerProfile.nickname || '판매자'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            ?
                          </div>
                        )}
                      </div>
                      <span className="font-medium">
                        {sellerProfile.nickname || '익명 사용자'}
                      </span>
                    </Link>
                  </div>
                )}

                <div className="flex items-start">
                  <span className="w-24 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                    위치
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {product.location}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="w-24 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                    등록일
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(product.created_at)}
                  </span>
                </div>

                {product.like_count !== undefined && product.like_count > 0 && (
                  <div className="flex items-start">
                    <span className="w-24 flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                      관심
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      ❤️ {product.like_count}
                    </span>
                  </div>
                )}
              </div>

              {/* 좋아요 버튼 */}
              <div className="mt-6">
                <LikeButton
                  productId={product.id}
                  initialLikeCount={product.like_count}
                  variant="detail"
                  className="w-full"
                />
              </div>

              {/* 결제 버튼 */}
              {!isPaid && product.status === '판매중' && (
                <div className="mt-4">
                  <Link
                    href={`/payment/${product.id}?price=${product.price}&title=${encodeURIComponent(product.title)}`}
                    className="block w-full rounded-lg bg-orange-600 py-4 text-center text-lg font-bold text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                  >
                    💳 결제하기
                  </Link>
                </div>
              )}
              
              {/* 결제 완료 상태 표시 */}
              {isPaid && (
                <div className="mt-4">
                  <div className="w-full rounded-lg bg-gray-300 py-4 text-center text-lg font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    ✅ 결제 완료된 상품입니다
                  </div>
                </div>
              )}

              {/* 액션 버튼 (수정/삭제) */}
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

