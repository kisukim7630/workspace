import ProductList from '@/components/ProductList';
import SearchBar from '@/components/SearchBar';
import { Product } from '@/components/ProductCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import supabase from '@/lib/supabase';

interface SearchParams {
  keyword?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
}

async function getProducts(
  searchParams: SearchParams
): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*');

    // 키워드 검색 (상품명에 포함된 경우)
    if (searchParams.keyword) {
      query = query.ilike('title', `%${searchParams.keyword}%`);
    }

    // 판매 상태 필터
    if (searchParams.status && searchParams.status !== '전체') {
      query = query.eq('status', searchParams.status);
    }

    // 가격 범위 필터
    if (searchParams.minPrice) {
      query = query.gte('price', parseInt(searchParams.minPrice));
    }
    if (searchParams.maxPrice) {
      query = query.lte('price', parseInt(searchParams.maxPrice));
    }

    // 위치 필터
    if (searchParams.location) {
      query = query.ilike('location', `%${searchParams.location}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          중고거래 상품
        </h1>
        <SearchBar />
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              검색 결과가 없습니다
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              다른 검색어로 시도해보세요
            </p>
          </div>
        ) : (
          <ProductList products={products} />
        )}
      </div>
      <FloatingActionButton />
    </div>
  );
}
