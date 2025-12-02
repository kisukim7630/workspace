import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Service Role Key가 없으면 Anon Key 사용 (RLS 우회 불가)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount, productId } = await request.json();

    // 토스페이먼츠 시크릿 키
    const secretKey = process.env.TOSS_SECRET_KEY;

    if (!secretKey) {
      throw new Error('토스페이먼츠 시크릿 키가 설정되지 않았습니다.');
    }

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('토스페이먼츠 결제 승인 실패:', data);
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || '결제 승인에 실패했습니다.',
          code: data.code 
        },
        { status: response.status }
      );
    }

    // 결제 성공 - 데이터베이스에 주문 정보 저장
    console.log('결제 승인 성공:', data);

    try {
      console.log('======================================');
      console.log('📦 주문 정보 저장 시작...');
      console.log('Supabase URL:', supabaseUrl);
      console.log('Supabase Key 존재:', !!supabaseKey);
      console.log('Product ID:', productId);
      
      // Service Role Key로 RLS 우회
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      // 현재 인증된 사용자 ID 가져오기 (없으면 null)
      const authHeader = request.headers.get('authorization');
      let userId = null;
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
        console.log('사용자 ID:', userId);
      }

      // 주문 정보 저장
      const orderData = {
        order_id: data.orderId,
        payment_key: data.paymentKey,
        user_id: userId,
        product_id: productId,
        order_name: data.orderName,
        amount: data.totalAmount,
        status: data.status,
        method: data.method,
        approved_at: data.approvedAt,
        customer_name: data.customerName || null,
        customer_email: data.customerEmail || null,
      };
      
      console.log('저장할 주문 데이터:', JSON.stringify(orderData, null, 2));

      const { data: insertedData, error: insertError } = await supabase
        .from('orders')
        .insert(orderData)
        .select();

      if (insertError) {
        console.error('❌ 주문 정보 저장 실패:', insertError);
        console.error('오류 상세:', JSON.stringify(insertError, null, 2));
        // 주문 저장 실패해도 결제는 성공했으므로 계속 진행
      } else {
        console.log('✅ 주문 정보 저장 성공:', insertedData);
      }
    } catch (dbError) {
      console.error('❌ 데이터베이스 처리 중 오류:', dbError);
      if (dbError instanceof Error) {
        console.error('오류 메시지:', dbError.message);
        console.error('오류 스택:', dbError.stack);
      }
      // DB 오류가 있어도 결제는 성공했으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('결제 승인 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '결제 승인 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

