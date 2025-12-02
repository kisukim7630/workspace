// Supabase 데이터베이스 타입 정의

export interface Like {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface LikeStatus {
  liked: boolean;
  likeCount: number;
}

// 토스페이먼츠 결제 타입 정의
export interface PaymentRequest {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  productId: string;
}

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentConfirmResponse {
  orderId: string;
  orderName: string;
  status: string;
  approvedAt: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  paymentKey: string;
  method: string;
}

// 주문 타입 정의
export interface Order {
  id: string;
  order_id: string;
  payment_key: string;
  user_id: string | null;
  product_id: string;
  order_name: string;
  amount: number;
  status: string;
  method: string | null;
  approved_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  updated_at: string;
}

