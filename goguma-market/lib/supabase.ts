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

// 서버 사이드에서 사용할 Supabase 클라이언트 생성
let supabaseClient: ReturnType<typeof createClient>;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // 서버 사이드에서는 세션을 저장하지 않음
      autoRefreshToken: false,
    },
  });
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  throw new Error('Failed to initialize Supabase client');
}

export default supabaseClient;

