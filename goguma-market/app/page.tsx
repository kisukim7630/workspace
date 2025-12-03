// 목업용 홈 페이지 (더미 데이터 사용)
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockProducts, categories } from '@/lib/mock-data';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'price-low' | 'price-high'>('latest');

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // 카테고리 필터
    if (selectedCategory !== '전체') {
      // 목업에서는 모든 상품 표시
    }

    // 정렬
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.like_count - a.like_count);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [selectedCategory, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            고구마 마켓
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            지역 기반 중고 거래 플랫폼
          </p>
        </div>

        {/* 필터 바 */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">카테고리:</span>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
            </select>
          </div>
        </div>

        {/* 상품 그리드 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {product.status !== '판매중' && (
                  <div className="absolute top-2 right-2 rounded-full bg-gray-800/70 px-2 py-1 text-xs font-medium text-white">
                    {product.status}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {product.title}
                </h3>
                <div className="mb-1 text-base font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(product.price)}원
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{product.location}</span>
                  <span className="flex items-center gap-1">
                    ❤️ {product.like_count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
