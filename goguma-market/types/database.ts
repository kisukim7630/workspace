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

// 리뷰 타입 정의
export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  order_id: string;
  product_id: string;
  rating: number; // 1~5
  comment: string | null;
  review_type: '구매자' | '판매자';
  created_at: string;
  updated_at: string;
}

// 프로필 타입 확장
export interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  temperature: number | null;
  created_at: string;
  updated_at: string;
}

