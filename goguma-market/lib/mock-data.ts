// 목업용 더미 데이터

export interface MockProduct {
  id: string;
  title: string;
  price: number;
  location: string;
  image_url: string;
  like_count: number;
  status: '판매중' | '예약중' | '판매완료';
  created_at: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: '1',
    title: '아이폰 14 프로 맥스 256GB',
    price: 850000,
    location: '서울시 강남구',
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    like_count: 12,
    status: '판매중',
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: '2',
    title: '에어팟 프로 2세대',
    price: 250000,
    location: '서울시 마포구',
    image_url: 'https://images.unsplash.com/photo-1606220945770-b5b7c2c55bf1?w=400&h=400&fit=crop',
    like_count: 8,
    status: '판매중',
    created_at: '2025-12-01T11:00:00Z',
  },
  {
    id: '3',
    title: '맥북 프로 14인치 M2',
    price: 1800000,
    location: '서울시 서초구',
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
    like_count: 25,
    status: '예약중',
    created_at: '2025-12-01T12:00:00Z',
  },
  {
    id: '4',
    title: '나이키 에어맥스 운동화',
    price: 120000,
    location: '서울시 송파구',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    like_count: 5,
    status: '판매중',
    created_at: '2025-12-01T13:00:00Z',
  },
  {
    id: '5',
    title: '갤럭시 버즈2 프로',
    price: 180000,
    location: '서울시 강동구',
    image_url: 'https://images.unsplash.com/photo-1606220945770-b5b7c2c55bf1?w=400&h=400&fit=crop',
    like_count: 3,
    status: '판매중',
    created_at: '2025-12-01T14:00:00Z',
  },
  {
    id: '6',
    title: '아이패드 프로 12.9인치',
    price: 950000,
    location: '서울시 종로구',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    like_count: 15,
    status: '판매중',
    created_at: '2025-12-01T15:00:00Z',
  },
  {
    id: '7',
    title: '에어컨 삼성 무풍',
    price: 450000,
    location: '서울시 노원구',
    image_url: 'https://images.unsplash.com/photo-1631541712601-7b8b8b8b8b8b?w=400&h=400&fit=crop',
    like_count: 7,
    status: '판매완료',
    created_at: '2025-12-01T16:00:00Z',
  },
  {
    id: '8',
    title: '자전거 픽시',
    price: 280000,
    location: '서울시 성동구',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    like_count: 9,
    status: '판매중',
    created_at: '2025-12-01T17:00:00Z',
  },
  {
    id: '9',
    title: '게이밍 의자',
    price: 150000,
    location: '서울시 영등포구',
    image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    like_count: 4,
    status: '판매중',
    created_at: '2025-12-01T18:00:00Z',
  },
  {
    id: '10',
    title: '캠핑 텐트 4인용',
    price: 320000,
    location: '서울시 강서구',
    image_url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=400&fit=crop',
    like_count: 11,
    status: '판매중',
    created_at: '2025-12-01T19:00:00Z',
  },
];

export const categories = [
  '전체',
  '디지털/가전',
  '가구/인테리어',
  '의류/잡화',
  '생활/가공식품',
  '스포츠/레저',
  '취미/게임/음반',
  '뷰티/미용',
  '육아/유아도구',
  '반려동물용품',
  '기타',
];

export const locations = [
  '전체 지역',
  '서울시 강남구',
  '서울시 마포구',
  '서울시 서초구',
  '서울시 송파구',
  '서울시 강동구',
  '서울시 종로구',
  '서울시 노원구',
  '서울시 성동구',
  '서울시 영등포구',
  '서울시 강서구',
];

