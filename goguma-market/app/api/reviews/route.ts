import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase.from('reviews').select('*');

    if (userId) {
      query = query.eq('reviewee_id', userId);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('리뷰 조회 실패:', error);
      return NextResponse.json(
        { success: false, message: '리뷰 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('리뷰 조회 에러:', error);
    return NextResponse.json(
      { success: false, message: '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 리뷰 작성
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, productId, revieweeId, rating, comment, reviewType } = body;

    // 유효성 검사
    if (!orderId || !productId || !revieweeId || !rating || !reviewType) {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: '평점은 1~5점 사이여야 합니다.' },
        { status: 400 }
      );
    }

    // 리뷰 작성
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        order_id: orderId,
        product_id: productId,
        rating,
        comment: comment || null,
        review_type: reviewType,
      })
      .select()
      .single();

    if (error) {
      console.error('리뷰 작성 실패:', error);
      
      // 중복 리뷰 에러
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, message: '이미 리뷰를 작성하셨습니다.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, message: '리뷰 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('리뷰 작성 에러:', error);
    return NextResponse.json(
      { success: false, message: '리뷰 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

