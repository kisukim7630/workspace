'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockProducts, categories, locations } from '@/lib/mock-data';

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedLocation, setSelectedLocation] = useState('전체 지역');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'price-low' | 'price-high'>('latest');

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // 키워드 검색
    if (keyword) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // 카테고리 필터 (목업에서는 모든 상품 표시)
    if (selectedCategory !== '전체') {
      // 실제로는 카테고리 필드가 필요하지만 목업에서는 생략
    }

    // 지역 필터
    if (selectedLocation !== '전체 지역') {
      filtered = filtered.filter((product) => product.location === selectedLocation);
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
  }, [keyword, selectedCategory, selectedLocation, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* 필터 사이드바 */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">필터</h2>

              {/* 카테고리 필터 */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  카테고리
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 지역 필터 */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  지역
                </h3>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* 필터 초기화 */}
              <button
                onClick={() => {
                  setKeyword('');
                  setSelectedCategory('전체');
                  setSelectedLocation('전체 지역');
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                필터 초기화
              </button>
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1">
            {/* 검색 바 */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="상품명을 검색하세요..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
                <button className="rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600">
                  검색
                </button>
              </div>
            </div>

            {/* 정렬 옵션 */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                총 {filteredProducts.length}개의 상품
              </p>
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

            {/* 상품 목록 */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-lg bg-white p-16 text-center shadow-sm dark:bg-gray-900">
                <div className="mb-4 text-6xl">🔍</div>
                <p className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  검색 결과가 없습니다
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  다른 검색어나 필터를 시도해보세요
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

