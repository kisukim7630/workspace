-- Storage 버킷 생성 (Supabase 대시보드의 Storage 섹션에서도 생성 가능)
-- Storage > Create bucket > bucket name: "product-images" > Public bucket 체크

-- Storage 버킷 정책 설정 (모든 사용자가 읽기 가능, 인증된 사용자만 업로드 가능)
-- Storage > product-images > Policies에서 설정하거나 아래 SQL 실행

-- 읽기 정책 (모든 사용자)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 업로드 정책 (인증된 사용자만)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- 삭제 정책 (본인이 업로드한 파일만 삭제 가능 - 선택사항)
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

