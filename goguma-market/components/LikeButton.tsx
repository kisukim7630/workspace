'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  productId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  variant?: 'card' | 'detail';
  className?: string;
}

export default function LikeButton({
  productId,
  initialLiked = false,
  initialLikeCount = 0,
  variant = 'card',
  className = '',
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 로그인 상태 및 좋아요 상태 확인
  useEffect(() => {
    const checkAuthAndLikeStatus = async () => {
      try {
        // 세션 확인 (getUser 대신 getSession 사용)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        const isUserLoggedIn = !!session?.user;
        setIsLoggedIn(isUserLoggedIn);

        // 좋아요 상태는 항상 API에서 확인 (로그인 여부와 상관없이)
        const response = await fetch(`/api/likes/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setLiked(data.liked);
          setLikeCount(data.likeCount);
        }
      } catch (error) {
        console.error('상태 확인 실패:', error);
      }
    };

    checkAuthAndLikeStatus();
  }, [productId, supabase.auth]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // 카드 클릭 이벤트 방지
    e.stopPropagation();

    if (isLoading) return;

    // 실시간으로 로그인 상태 재확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      // 로그인하지 않은 경우 로그인 페이지로 이동
      console.log('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/likes/${productId}`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API 에러:', data);
        throw new Error(data.error || '좋아요 처리 실패');
      }

      setLiked(data.liked);
      setLikeCount(data.likeCount);

      // 페이지 리프레시 (서버 컴포넌트 데이터 갱신)
      router.refresh();
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert(`좋아요 처리에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'card') {
    // 카드에서 사용하는 작은 버튼
    return (
      <button
        onClick={handleLikeToggle}
        disabled={isLoading}
        className={`flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs transition-all hover:bg-white disabled:opacity-50 dark:bg-gray-800/90 dark:hover:bg-gray-800 ${className}`}
        title={liked ? '좋아요 취소' : '좋아요'}
      >
        <span className={`transition-transform ${isLoading ? 'scale-90' : liked ? 'scale-110' : 'scale-100'}`}>
          {liked ? '❤️' : '🤍'}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {likeCount}
        </span>
      </button>
    );
  }

  // 상세 페이지에서 사용하는 큰 버튼
  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium transition-all disabled:opacity-50 ${
        liked
          ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      } ${className}`}
      title={liked ? '좋아요 취소' : '좋아요'}
    >
      <span className={`text-xl transition-transform ${isLoading ? 'scale-90' : liked ? 'scale-110' : 'scale-100'}`}>
        {liked ? '❤️' : '🤍'}
      </span>
      <span>
        {liked ? '좋아요 취소' : '좋아요'} ({likeCount})
      </span>
    </button>
  );
}

