import Link from 'next/link';
import Image from 'next/image';
import LikeButton from './LikeButton';

export interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  image_url: string;
  like_count?: number;
  status?: '판매중' | '예약중' | '판매완료';
  created_at?: string;
  user_id?: string;
}

// DB에서 가져온 데이터를 컴포넌트에서 사용하는 형식으로 변환
export function mapProductFromDB(product: any): Product {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    location: product.location,
    image_url: product.image_url,
    like_count: product.like_count,
    status: product.status,
    created_at: product.created_at,
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case '판매완료':
        return 'bg-gray-500';
      case '예약중':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const isSoldOut = product.status === '판매완료';

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          className={`object-cover transition-transform ${
            isSoldOut ? 'opacity-40 grayscale' : 'group-hover:scale-105'
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {/* 판매완료 오버레이 */}
        {isSoldOut && (
          <>
            {/* 어두운 배경 */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/60"></div>
            
            {/* 중앙 배지 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white px-6 py-4 shadow-2xl dark:bg-gray-800">
                <div className="text-4xl">🔒</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-500">
                  판매완료
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* 상태 배지 (예약중만 표시) */}
        {product.status === '예약중' && (
          <div
            className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium text-white ${getStatusColor(product.status)}`}
          >
            {product.status}
          </div>
        )}
        
        {/* 좋아요 버튼 */}
        {!isSoldOut && (
          <div className="absolute bottom-2 right-2">
            <LikeButton
              productId={product.id}
              initialLikeCount={product.like_count}
              variant="card"
            />
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className={`p-4 ${isSoldOut ? 'opacity-60' : ''}`}>
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {product.title}
        </h3>
        <div className="mb-1 text-base font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(product.price)}원
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{product.location}</span>
          {isSoldOut && (
            <span className="font-medium text-gray-600 dark:text-gray-400">
              판매완료
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

