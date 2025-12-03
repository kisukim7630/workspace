export type Restaurant = {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  cuisine: string;
  priceRange: string;
  distance: number;
  menu: string[];
};

export const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "맛있는 식당",
    image: "https://picsum.photos/400/300?random=1",
    rating: 4.5,
    reviewCount: 128,
    location: "강남구",
    cuisine: "한식",
    priceRange: "2만원대",
    distance: 0.5,
    menu: ["비빔밥", "불고기", "삼겹살"],
  },
  {
    id: "2",
    name: "고급 레스토랑",
    image: "https://picsum.photos/400/300?random=2",
    rating: 4.8,
    reviewCount: 256,
    location: "서초구",
    cuisine: "양식",
    priceRange: "5만원대",
    distance: 1.2,
    menu: ["스테이크", "파스타", "피자"],
  },
  {
    id: "3",
    name: "일본식당",
    image: "https://picsum.photos/400/300?random=3",
    rating: 4.6,
    reviewCount: 189,
    location: "홍대",
    cuisine: "일식",
    priceRange: "3만원대",
    distance: 2.5,
    menu: ["초밥", "라멘", "우동"],
  },
  {
    id: "4",
    name: "중화요리",
    image: "https://picsum.photos/400/300?random=4",
    rating: 4.3,
    reviewCount: 95,
    location: "명동",
    cuisine: "중식",
    priceRange: "2만원대",
    distance: 3.0,
    menu: ["짜장면", "짬뽕", "탕수육"],
  },
  {
    id: "5",
    name: "이탈리안 레스토랑",
    image: "https://picsum.photos/400/300?random=5",
    rating: 4.7,
    reviewCount: 203,
    location: "압구정",
    cuisine: "이탈리안",
    priceRange: "4만원대",
    distance: 1.8,
    menu: ["파스타", "리조또", "피자"],
  },
  {
    id: "6",
    name: "스테이크 하우스",
    image: "https://picsum.photos/400/300?random=6",
    rating: 4.9,
    reviewCount: 312,
    location: "청담동",
    cuisine: "양식",
    priceRange: "6만원대",
    distance: 2.2,
    menu: ["스테이크", "샐러드", "와인"],
  },
  {
    id: "7",
    name: "전통 한정식",
    image: "https://picsum.photos/400/300?random=7",
    rating: 4.4,
    reviewCount: 167,
    location: "종로구",
    cuisine: "한식",
    priceRange: "3만원대",
    distance: 4.5,
    menu: ["한정식", "정식", "코스요리"],
  },
  {
    id: "8",
    name: "일본 라면집",
    image: "https://picsum.photos/400/300?random=8",
    rating: 4.2,
    reviewCount: 89,
    location: "이태원",
    cuisine: "일식",
    priceRange: "1만원대",
    distance: 3.8,
    menu: ["라멘", "돈까스", "우동"],
  },
];

