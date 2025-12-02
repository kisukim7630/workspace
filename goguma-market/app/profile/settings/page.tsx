'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            router.push('/login');
          }
          return;
        }

        if (!mounted) return;
        setUser(user);

        // 프로필 조회
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('프로필 조회 실패:', profileError);
          // 프로필이 없으면 기본값으로 생성
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              nickname: user.email!.split('@')[0],
            })
            .select()
            .single();

          if (newProfile && mounted) {
            setProfile(newProfile);
            setNickname(newProfile.nickname || '');
            setBio(newProfile.bio || '');
            setPhone(newProfile.phone || '');
            setLocation(newProfile.location || '');
            setAvatarPreview(newProfile.avatar_url);
          }
        } else if (mounted) {
          setProfile(profileData);
          setNickname(profileData.nickname || '');
          setBio(profileData.bio || '');
          setPhone(profileData.phone || '');
          setLocation(profileData.location || '');
          setAvatarPreview(profileData.avatar_url);
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('프로필 로딩 오류:', err);
        if (mounted) {
          setError('프로필을 불러오는데 실패했습니다.');
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('이미지 크기는 2MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setAvatar(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      let avatarUrl = profile?.avatar_url;

      // 새 아바타 이미지가 있으면 업로드
      if (avatar && user) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('아바타 업로드 실패:', uploadError);
          setError('이미지 업로드에 실패했습니다.');
          setSaving(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName);

        avatarUrl = publicUrl;

        // 기존 아바타 삭제
        if (profile?.avatar_url?.includes('supabase.co')) {
          const oldPath = profile.avatar_url.split('/avatars/')[1];
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        }
      }

      // 프로필 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nickname: nickname.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('id', user!.id);

      if (updateError) {
        console.error('프로필 업데이트 실패:', updateError);
        setError('프로필 업데이트에 실패했습니다: ' + updateError.message);
        setSaving(false);
        return;
      }

      // 프로필 상태 업데이트 (리로드 대신)
      setProfile({
        ...profile!,
        nickname: nickname.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl || profile!.avatar_url,
      });

      setSuccess('프로필이 저장되었습니다!');
      setSaving(false);
      setAvatar(null); // 파일 입력 초기화

      // 성공 메시지 자동 숨김
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('프로필 저장 오류:', err);
      setError('프로필 저장 중 오류가 발생했습니다.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            프로필 설정
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            다른 사용자에게 보여질 프로필 정보를 설정하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            {/* 프로필 이미지 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                프로필 이미지
              </label>
              <div className="mt-2 flex items-center gap-6">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="프로필"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-gray-400">
                      {user?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    이미지 변경
                  </button>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF (최대 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              />
            </div>

            {/* 닉네임 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                닉네임 *
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="고구마마켓"
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>

            {/* 자기소개 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                자기소개
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자신을 소개해주세요"
                rows={4}
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>

            {/* 전화번호 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>

            {/* 활동 지역 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                활동 지역
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="서울특별시 강남구"
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

