import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 현재 사용자가 좋아요한 상품 목록 조회 (GET)
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자가 좋아요한 상품 목록 조회
    const { data: likes, error } = await supabase
      .from('likes')
      .select(
        `
        id,
        created_at,
        product_id,
        products (
          id,
          title,
          price,
          location,
          image_url,
          like_count,
          status,
          created_at,
          user_id
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('좋아요 목록 조회 실패:', error);
      return NextResponse.json(
        { error: '좋아요 목록 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // products 데이터 추출
    const products = likes
      ?.map((like: any) => like.products)
      .filter((product: any) => product !== null) || [];

    return NextResponse.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('좋아요 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '좋아요 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

