'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

interface LocationData {
  latitude: number;
  longitude: number;
}

// IP 주소 가져오기
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

// 오늘 추천을 받았는지 확인
async function hasRecommendedToday(ipAddress: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('lunch_recommendations')
    .select('id')
    .eq('ip_address', ipAddress)
    .eq('recommended_at', today)
    .single();

  return !!data;
}

// 추천 기록 저장
async function saveRecommendation(ipAddress: string) {
  const today = new Date().toISOString().split('T')[0];

  await supabase
    .from('lunch_recommendations')
    .insert([{ ip_address: ipAddress, recommended_at: today }]);
}

// AI 응답에서 메뉴 이름 추출
function parseMenuNames(aiResponse: string): string[] {
  const menus: string[] = [];

  console.log('=== AI 응답 ===');
  console.log(aiResponse);

  // **텍스트** 형태 찾기
  const boldMatches = aiResponse.matchAll(/\*\*([가-힣a-zA-Z0-9\s]+)\*\*/g);
  for (const match of boldMatches) {
    const menuName = match[1].trim();
    if (menuName.length >= 2 && menuName.length < 30 && !/^\d+$/.test(menuName)) {
      if (!menus.includes(menuName)) {
        menus.push(menuName);
        console.log('✅ 추출:', menuName);
      }
    }
  }

  console.log('최종 메뉴:', menus);
  return menus.slice(0, 5);
}

export async function recommendLunch(location: LocationData) {
  const apiKey = process.env.GEMINI_API_KEY;
  const clientIP = await getClientIP();

  if (!apiKey) {
    return {
      success: false,
      message: 'API Key가 설정되지 않았습니다.',
      menus: [],
    };
  }

  const alreadyRecommended = await hasRecommendedToday(clientIP);
  if (alreadyRecommended) {
    return {
      success: false,
      message: '오늘은 이미 추천을 받으셨습니다. 내일 다시 시도해주세요!',
      menus: [],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `당신은 맛집 추천 전문가입니다.
사용자의 현재 위치: 위도 ${location.latitude}, 경도 ${location.longitude}

이 위치 근처에서 점심 식사하기 좋은 음식점을 정확히 3곳 추천해주세요.
각 음식점은 다음 형식으로 작성해주세요:

1. **음식점 이름**
- 음식 종류: 한식/중식/일식 등
- 추천 이유: 간단한 설명

2. **음식점 이름**
- 음식 종류: 한식/중식/일식 등
- 추천 이유: 간단한 설명

3. **음식점 이름**
- 음식 종류: 한식/중식/일식 등
- 추천 이유: 간단한 설명

중요: 음식점 이름은 반드시 **별표 두개**로 감싸주세요.
친근하고 유용한 어조로 작성해주세요. 한국어로 답변해주세요.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const menuNames = parseMenuNames(text);
    await saveRecommendation(clientIP);

    const addedMenus: string[] = [];
    for (const menuName of menuNames) {
      try {
        const { data: existing } = await supabase
          .from('lunch_menus')
          .select('id')
          .eq('menu_name', menuName)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('lunch_menus')
            .insert([{ menu_name: menuName }]);

          if (!error) {
            addedMenus.push(menuName);
            console.log('✅ DB 추가:', menuName);
          }
        }
      } catch (error) {
        console.error('메뉴 추가 오류:', error);
      }
    }

    return {
      success: true,
      message: text,
      menus: addedMenus,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      message: `추천 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`,
      menus: [],
    };
  }
}
