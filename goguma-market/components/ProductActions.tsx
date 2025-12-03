'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';
import { Product } from './ProductCard';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(true);

    try {
      const supabase = createClient();

      // 상품 삭제
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) {
        alert('상품 삭제에 실패했습니다.');
        setDeleting(false);
        return;
      }

      // 이미지도 삭제 (선택사항)
      if (product.image_url.includes('supabase.co')) {
        const imagePath = product.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('product-images')
            .remove([`products/${imagePath}`]);
        }
      }

      // 홈으로 리다이렉트
      router.push('/');
      router.refresh();
    } catch (err) {
      alert('상품 삭제 중 오류가 발생했습니다.');
      setDeleting(false);
    }
  };

  // 로딩 중이거나 로그인하지 않은 경우
  if (loading || !user) {
    return null;
  }

  // 내 상품이 아닌 경우
  if (product.user_id !== user.id) {
    return null;
  }

  // 내 상품인 경우 수정/삭제 버튼 표시
  return (
    <div className="mt-6 flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-800">
      <Link
        href={`/products/${product.id}/edit`}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-1 rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-600"
      >
        {deleting ? '삭제 중...' : '삭제'}
      </button>
    </div>
  );
}


