'use server';

import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

interface LunchMenu {
    id: number;
    menu_name: string;
    description: string | null;
    vote_count?: number;
    has_voted?: boolean;
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

// 메뉴 목록 조회
export async function getLunchMenus() {
    try {
        const clientIP = await getClientIP();

        // 메뉴 목록 가져오기
        const { data: menus, error: menusError } = await supabase
            .from('lunch_menus')
            .select('*')
            .order('created_at', { ascending: false });

        if (menusError) {
            console.error('메뉴 조회 오류:', menusError);
            return { success: false, menus: [] };
        }

        // 각 메뉴의 투표 수와 현재 IP의 투표 여부 확인
        const menusWithVotes = await Promise.all(
            (menus || []).map(async (menu) => {
                // 투표 수 조회
                const { count } = await supabase
                    .from('lunch_votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('menu_id', menu.id);

                // 현재 IP의 투표 여부 확인
                const { data: userVote } = await supabase
                    .from('lunch_votes')
                    .select('id')
                    .eq('menu_id', menu.id)
                    .eq('ip_address', clientIP)
                    .single();

                return {
                    ...menu,
                    vote_count: count || 0,
                    has_voted: !!userVote,
                };
            })
        );

        return { success: true, menus: menusWithVotes };
    } catch (error) {
        console.error('메뉴 조회 오류:', error);
        return { success: false, menus: [] };
    }
}

// 메뉴 추가
export async function addLunchMenu(menuName: string, description?: string) {
    try {
        const { data, error } = await supabase
            .from('lunch_menus')
            .insert([{ menu_name: menuName, description }])
            .select()
            .single();

        if (error) {
            console.error('메뉴 추가 오류:', error);
            return { success: false, message: '메뉴 추가에 실패했습니다.' };
        }

        return { success: true, menu: data };
    } catch (error) {
        console.error('메뉴 추가 오류:', error);
        return { success: false, message: '메뉴 추가 중 오류가 발생했습니다.' };
    }
}

// 투표하기
export async function voteForMenu(menuId: number) {
    try {
        const clientIP = await getClientIP();

        // 이미 투표했는지 확인
        const { data: existingVote } = await supabase
            .from('lunch_votes')
            .select('id')
            .eq('menu_id', menuId)
            .eq('ip_address', clientIP)
            .single();

        if (existingVote) {
            return { success: false, message: '이미 투표하셨습니다.' };
        }

        // 투표 추가
        const { error } = await supabase
            .from('lunch_votes')
            .insert([{ menu_id: menuId, ip_address: clientIP }]);

        if (error) {
            console.error('투표 오류:', error);
            return { success: false, message: '투표에 실패했습니다.' };
        }

        return { success: true, message: '투표가 완료되었습니다!' };
    } catch (error) {
        console.error('투표 오류:', error);
        return { success: false, message: '투표 중 오류가 발생했습니다.' };
    }
}

// 투표 취소
export async function unvoteForMenu(menuId: number) {
    try {
        const clientIP = await getClientIP();

        const { error } = await supabase
            .from('lunch_votes')
            .delete()
            .eq('menu_id', menuId)
            .eq('ip_address', clientIP);

        if (error) {
            console.error('투표 취소 오류:', error);
            return { success: false, message: '투표 취소에 실패했습니다.' };
        }

        return { success: true, message: '투표가 취소되었습니다.' };
    } catch (error) {
        console.error('투표 취소 오류:', error);
        return { success: false, message: '투표 취소 중 오류가 발생했습니다.' };
    }
}
