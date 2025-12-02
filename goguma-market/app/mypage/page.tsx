'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';
import { Product } from '@/components/ProductCard';
import Image from 'next/image';

interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'likes'>('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    sellingProducts: 0,
    reservedProducts: 0,
    soldProducts: 0,
  });

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    // 사용자 정보 및 상품 가져오기
    async function loadUserData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        if (!mounted) return;
        setUser(session.user);

        // 프로필 조회
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData && mounted) {
          setProfile(profileData);
        }

        // 내가 등록한 상품 조회
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error && products && mounted) {
          setMyProducts(products);

          // 통계 계산
          setStats({
            totalProducts: products.length,
            sellingProducts: products.filter((p) => p.status === '판매중')
              .length,
            reservedProducts: products.filter((p) => p.status === '예약중')
              .length,
            soldProducts: products.filter((p) => p.status === '판매완료')
              .length,
          });
        }

        // 좋아요한 상품 조회
        try {
          const response = await fetch('/api/likes/user');
          if (response.ok) {
            const data = await response.json();
            if (mounted) {
              setLikedProducts(data.products || []);
            }
          }
        } catch (err) {
          console.error('좋아요 목록 조회 오류:', err);
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '판매중':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '예약중':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '판매완료':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 프로필 섹션 */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="프로필"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-white">
                  {user.email?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profile?.nickname || user.email}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    프로필 설정
                  </Link>
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    프로필 보기
                  </Link>
                </div>
              </div>
              {profile?.bio && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {profile.bio}
                </p>
              )}
              {profile?.location && (
                <p className="mt-2 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {profile.location}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                가입일: {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* 통계 섹션 */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-6 text-center shadow-sm dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              전체 상품
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalProducts}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">판매중</p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.sellingProducts}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">예약중</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.reservedProducts}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              판매완료
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-600 dark:text-gray-400">
              {stats.soldProducts}
            </p>
          </div>
        </div>

        {/* 탭 & 상품 목록 */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          {/* 탭 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-3 text-lg font-semibold transition-colors ${
                  activeTab === 'products'
                    ? 'border-b-2 border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                내 상품 ({myProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`pb-3 text-lg font-semibold transition-colors ${
                  activeTab === 'likes'
                    ? 'border-b-2 border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                좋아요 ({likedProducts.length})
              </button>
            </div>
            {activeTab === 'products' && (
              <Link
                href="/products/new"
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                + 상품 등록
              </Link>
            )}
          </div>

          {/* 내 상품 탭 */}
          {activeTab === 'products' && (
            <>
              {myProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mb-4 text-6xl">📦</div>
                  <p className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                    등록한 상품이 없습니다
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    첫 상품을 등록해보세요!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {myProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute right-2 top-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                product.status
                              )}`}
                            >
                              {product.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="mb-2 truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {product.title}
                          </h3>
                          <p className="mb-2 text-xl font-bold text-orange-600 dark:text-orange-400">
                            {formatPrice(product.price)}원
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              📍 {product.location}
                            </span>
                            <span className="flex items-center gap-1">
                              ❤️ {product.like_count}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(product.created_at)}
                          </p>
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="block w-full rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          수정하기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 좋아요 탭 */}
          {activeTab === 'likes' && (
            <>
              {likedProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mb-4 text-6xl">❤️</div>
                  <p className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                    좋아요한 상품이 없습니다
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    마음에 드는 상품에 좋아요를 눌러보세요!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {likedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          {product.status && product.status !== '판매중' && (
                            <div className="absolute right-2 top-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                  product.status
                                )}`}
                              >
                                {product.status}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="mb-2 truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {product.title}
                          </h3>
                          <p className="mb-2 text-xl font-bold text-orange-600 dark:text-orange-400">
                            {formatPrice(product.price)}원
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              📍 {product.location}
                            </span>
                            <span className="flex items-center gap-1">
                              ❤️ {product.like_count || 0}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(product.created_at)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

