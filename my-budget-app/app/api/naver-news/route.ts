import { NextRequest, NextResponse } from 'next/server';

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsResponse {
  items: NaverNewsItem[];
  total: number;
  start: number;
  display: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '경제';
  const display = parseInt(searchParams.get('display') || '10');
  const start = parseInt(searchParams.get('start') || '1');

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: '네이버 API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=date`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('네이버 API 오류:', errorText);
      return NextResponse.json(
        { error: '네이버 API 호출에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data: NaverNewsResponse = await response.json();

    // HTML 태그 제거 및 정리
    const cleanedItems = data.items.map((item) => ({
      ...item,
      title: item.title.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' '),
      description: item.description.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' '),
    }));

    return NextResponse.json({
      items: cleanedItems,
      total: data.total,
      start: data.start,
      display: data.display,
    });
  } catch (error) {
    console.error('뉴스 수집 오류:', error);
    return NextResponse.json(
      { error: '뉴스 수집 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

