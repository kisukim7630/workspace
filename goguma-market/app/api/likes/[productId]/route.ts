import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 좋아요 상태 확인 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const supabase = await createServerSupabaseClient();

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { liked: false, likeCount: 0 },
        { status: 200 }
      );
    }

    // 사용자가 이 상품을 좋아요 했는지 확인
    const { data: like, error: likeError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (likeError) {
      console.error('좋아요 조회 실패:', likeError);
      return NextResponse.json(
        { error: '좋아요 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 상품의 총 좋아요 수 조회
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('like_count')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('상품 조회 실패:', productError);
      return NextResponse.json(
        { error: '상품 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      liked: !!like,
      likeCount: product?.like_count || 0,
    });
  } catch (error) {
    console.error('좋아요 상태 확인 실패:', error);
    return NextResponse.json(
      { error: '좋아요 상태 확인에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 좋아요 토글 (POST)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const supabase = await createServerSupabaseClient();

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('좋아요 토글 - 사용자:', user?.id, '에러:', authError);

    if (!user) {
      console.log('좋아요 토글 - 인증 실패');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log('좋아요 토글 시작 - 사용자:', user.id, '상품:', productId);

    // 상품 존재 여부 확인
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 좋아요한 상품인지 확인
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    let liked: boolean;

    if (existingLike) {
      // 이미 좋아요한 경우 -> 좋아요 취소
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('좋아요 취소 실패:', deleteError);
        return NextResponse.json(
          { error: `좋아요 취소에 실패했습니다: ${deleteError.message}` },
          { status: 500 }
        );
      }
      console.log('좋아요 취소 성공');
      liked = false;
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (insertError) {
        console.error('좋아요 추가 실패:', insertError);
        return NextResponse.json(
          { error: `좋아요 추가에 실패했습니다: ${insertError.message}` },
          { status: 500 }
        );
      }
      console.log('좋아요 추가 성공');
      liked = true;
    }

    // 업데이트된 좋아요 수 조회
    const { data: updatedProduct } = await supabase
      .from('products')
      .select('like_count')
      .eq('id', productId)
      .single();

    return NextResponse.json({
      liked,
      likeCount: updatedProduct?.like_count || 0,
    });
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    return NextResponse.json(
      { error: '좋아요 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
