import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase URL과 Key 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경변수 검증
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Supabase 클라이언트 생성
let supabaseClient: ReturnType<typeof createClient> | null = null;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  throw new Error('Failed to initialize Supabase client');
}

// 클라이언트가 null인 경우 에러 처리
if (!supabaseClient) {
  throw new Error('Supabase client is not initialized');
}

export default supabaseClient;

