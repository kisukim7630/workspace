import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { Product } from '@/components/ProductCard';

interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  temperature: number | null;
  created_at: string;
}

async function getProfile(id: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
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

async function getUserProducts(userId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .eq('status', '판매중')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('상품 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return [];
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile(id);
  const products = await getUserProducts(id);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-900 dark:text-gray-100">
            프로필을 찾을 수 없습니다
          </p>
          <Link
            href="/"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 온도에 따른 색상 및 아이콘 결정
  const getTemperatureStyle = (temp: number | null) => {
    const temperature = temp ?? 36;
    
    if (temperature >= 70) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: '🔥',
        label: '매우 따뜻',
      };
    } else if (temperature >= 50) {
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        icon: '🌡️',
        label: '따뜻',
      };
    } else if (temperature >= 36) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: '🌤️',
        label: '보통',
      };
    } else if (temperature >= 20) {
      return {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: '❄️',
        label: '차갑',
      };
    } else {
      return {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        icon: '🧊',
        label: '매우 차갑',
      };
    }
  };

  const tempStyle = getTemperatureStyle(profile.temperature);
  const temperature = profile.temperature ?? 36;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* 프로필 헤더 */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* 프로필 이미지 */}
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.nickname || '프로필'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl text-gray-400">
                    {profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-2 flex items-center justify-center gap-3 sm:justify-start">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {profile.nickname || '익명 사용자'}
                  </h1>
                  {/* 온도 표시 */}
                  <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${tempStyle.bgColor} ${tempStyle.borderColor}`}>
                    <span className="text-lg">{tempStyle.icon}</span>
                    <span className={`text-lg font-bold ${tempStyle.color}`}>
                      {temperature.toFixed(1)}°
                    </span>
                  </div>
                </div>
                <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
                  {tempStyle.label}
                </p>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(profile.created_at)} 가입
                </p>

                {profile.bio && (
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    {profile.bio}
                  </p>
                )}

                <div className="space-y-2">
                  {profile.location && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 sm:justify-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {profile.phone && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 sm:justify-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 판매 중인 상품 */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                판매 중인 상품
              </h2>
              {products.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {products.length}개
                </span>
              )}
            </div>

            {products.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mb-4 text-6xl">📦</div>
                <p className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  판매 중인 상품이 없습니다
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
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
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


