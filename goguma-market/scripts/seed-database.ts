import supabase from '@/lib/supabase';

const dummyProducts = [
  {
    title: '아이폰 14 프로 맥스 256GB',
    price: 850000,
    location: '서울시 강남구',
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    like_count: 12,
    status: '판매중' as const,
  },
  {
    title: '에어팟 프로 2세대',
    price: 250000,
    location: '서울시 마포구',
    image_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
    like_count: 8,
    status: '판매중' as const,
  },
  {
    title: '맥북 프로 14인치 M2',
    price: 1800000,
    location: '서울시 서초구',
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
    like_count: 25,
    status: '예약중' as const,
  },
  {
    title: '나이키 에어맥스 운동화',
    price: 120000,
    location: '서울시 송파구',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    like_count: 5,
    status: '판매중' as const,
  },
  {
    title: '갤럭시 버즈2 프로',
    price: 180000,
    location: '서울시 강동구',
    image_url: 'https://images.unsplash.com/photo-1606220945770-b5b7c2c55bf1?w=400&h=400&fit=crop',
    like_count: 3,
    status: '판매중' as const,
  },
  {
    title: '아이패드 프로 12.9인치',
    price: 950000,
    location: '서울시 종로구',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    like_count: 15,
    status: '판매중' as const,
  },
  {
    title: '에어컨 삼성 무풍',
    price: 450000,
    location: '서울시 노원구',
    image_url: 'https://images.unsplash.com/photo-1631541712601-7b8b8b8b8b8b?w=400&h=400&fit=crop',
    like_count: 7,
    status: '판매완료' as const,
  },
  {
    title: '자전거 픽시',
    price: 280000,
    location: '서울시 성동구',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    like_count: 9,
    status: '판매중' as const,
  },
  {
    title: '게이밍 의자',
    price: 150000,
    location: '서울시 영등포구',
    image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    like_count: 4,
    status: '판매중' as const,
  },
  {
    title: '캠핑 텐트 4인용',
    price: 320000,
    location: '서울시 강서구',
    image_url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=400&fit=crop',
    like_count: 11,
    status: '판매중' as const,
  },
];

async function seedDatabase() {
  try {
    console.log('데이터베이스에 더미 데이터 삽입 중...');

    const { data, error } = await supabase
      .from('products')
      .insert(dummyProducts)
      .select();

    if (error) {
      console.error('데이터 삽입 실패:', error);
      process.exit(1);
    }

    console.log(`성공적으로 ${data?.length || 0}개의 상품을 삽입했습니다.`);
    process.exit(0);
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    process.exit(1);
  }
}

seedDatabase();



