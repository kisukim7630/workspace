'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getLunchMenus, addLunchMenu, voteForMenu, unvoteForMenu } from '../actions/lunchVoting';

interface LunchMenu {
    id: number;
    menu_name: string;
    description: string | null;
    vote_count?: number;
    has_voted?: boolean;
}

export interface LunchVotingRef {
    refresh: () => void;
}

const LunchVoting = forwardRef<LunchVotingRef>((props, ref) => {
    const [menus, setMenus] = useState<LunchMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMenuName, setNewMenuName] = useState('');
    const [message, setMessage] = useState('');

    const loadMenus = async () => {
        setLoading(true);
        const result = await getLunchMenus();
        if (result.success) {
            setMenus(result.menus);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadMenus();
    }, []);

    // Expose refresh method to parent
    useImperativeHandle(ref, () => ({
        refresh: loadMenus,
    }));

    const handleAddMenu = async () => {
        if (!newMenuName.trim()) {
            setMessage('메뉴 이름을 입력해주세요.');
            return;
        }

        const result = await addLunchMenu(newMenuName.trim());
        if (result.success) {
            setMessage('메뉴가 추가되었습니다!');
            setNewMenuName('');
            loadMenus();
        } else {
            setMessage(result.message || '메뉴 추가에 실패했습니다.');
        }

        setTimeout(() => setMessage(''), 3000);
    };

    const handleVote = async (menuId: number) => {
        const result = await voteForMenu(menuId);
        setMessage(result.message || '');
        if (result.success) {
            loadMenus();
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleUnvote = async (menuId: number) => {
        const result = await unvoteForMenu(menuId);
        setMessage(result.message || '');
        if (result.success) {
            loadMenus();
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const sortedMenus = [...menus].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    return (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg shadow-md p-6 border-2 border-green-200">
            <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2 mb-4">
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
                        d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                    />
                </svg>
                🗳️ 점심 메뉴 투표
            </h2>

            {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.includes('실패') || message.includes('이미') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* 메뉴 추가 */}
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMenu()}
                    placeholder="새 메뉴 추가 (예: 김치찌개)"
                    className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    onClick={handleAddMenu}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                    추가
                </button>
            </div>

            {/* 메뉴 목록 */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : menus.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    아직 메뉴가 없습니다. 첫 번째 메뉴를 추가해보세요!
                </div>
            ) : (
                <div className="space-y-2">
                    {sortedMenus.map((menu, index) => (
                        <div
                            key={menu.id}
                            className={`flex items-center justify-between p-4 bg-white rounded-lg border-2 transition-all ${menu.has_voted ? 'border-green-400 bg-green-50' : 'border-green-200'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className={`text-2xl font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-300'}`}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{menu.menu_name}</h3>
                                    {menu.description && (
                                        <p className="text-sm text-gray-600">{menu.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{menu.vote_count || 0}</div>
                                    <div className="text-xs text-gray-500">투표</div>
                                </div>

                                {menu.has_voted ? (
                                    <button
                                        onClick={() => handleUnvote(menu.id)}
                                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                                    >
                                        취소
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleVote(menu.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        투표
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-xs text-gray-500 text-center">
                💡 IP 주소당 각 메뉴에 1번씩만 투표할 수 있습니다
            </div>
        </div>
    );
});

LunchVoting.displayName = 'LunchVoting';

export default LunchVoting;
