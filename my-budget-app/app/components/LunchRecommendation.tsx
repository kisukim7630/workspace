'use client';

import { useState } from 'react';
import { recommendLunch } from '../actions/lunchRecommendation';

interface LunchRecommendationProps {
    onMenusAdded?: () => void;
}

export default function LunchRecommendation({ onMenusAdded }: LunchRecommendationProps) {
    const [recommendation, setRecommendation] = useState<string>('');
    const [addedMenus, setAddedMenus] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleRecommend = async () => {
        setLoading(true);
        setIsOpen(true);
        setRecommendation('위치 정보를 가져오는 중...');
        setAddedMenus([]);

        // 위치 정보 가져오기
        if (!navigator.geolocation) {
            setRecommendation('위치 정보를 지원하지 않는 브라우저입니다.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                setRecommendation('맛집을 찾는 중...');

                try {
                    const result = await recommendLunch(location);
                    if (result.success) {
                        setRecommendation(result.message || '추천 결과가 없습니다.');
                        setAddedMenus(result.menus || []);

                        // 투표 목록 새로고침 트리거
                        if (onMenusAdded && result.menus && result.menus.length > 0) {
                            setTimeout(() => onMenusAdded(), 500);
                        }
                    } else {
                        setRecommendation(result.message || '오류가 발생했습니다.');
                    }
                } catch (error) {
                    console.error('Lunch Recommendation Error:', error);
                    setRecommendation('추천 중 오류가 발생했습니다.');
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Geolocation Error:', error);
                setRecommendation(
                    '위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
                );
                setLoading(false);
            }
        );
    };

    return (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg shadow-md p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                        />
                    </svg>
                    🍽️ 점심 메뉴 추천
                </h2>
                <button
                    onClick={handleRecommend}
                    disabled={loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            추천 중...
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                />
                            </svg>
                            추천받기
                        </>
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                    {loading ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-orange-200 rounded w-3/4"></div>
                            <div className="h-4 bg-orange-200 rounded w-1/2"></div>
                            <div className="h-4 bg-orange-200 rounded w-5/6"></div>
                        </div>
                    ) : (
                        <>
                            <div className="prose prose-orange max-w-none text-gray-700 whitespace-pre-wrap">
                                {recommendation}
                            </div>
                            {addedMenus.length > 0 && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-semibold text-green-700 mb-2">
                                        ✅ 아래 메뉴가 투표 목록에 추가되었습니다:
                                    </p>
                                    <ul className="text-sm text-green-600 space-y-1">
                                        {addedMenus.map((menu, index) => (
                                            <li key={index}>• {menu}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
