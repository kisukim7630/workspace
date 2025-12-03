'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProduct } from '@/features/products/hooks/useCreateProduct';
import { PRODUCT_CATEGORIES } from '@/features/products/constants';
import { useRouter } from 'next/navigation';

const productFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하여야 합니다.'),
  description: z.string().max(5000, '설명은 5000자 이하여야 합니다.').optional(),
  price: z.number().int().min(0, '가격은 0원 이상이어야 합니다.'),
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  location: z.string().min(1, '거래 지역을 입력해주세요.'),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export const ProductForm = () => {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      location: '',
    },
  });

  const category = watch('category');

  const addImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
      if (imageUrls.length < 10) {
        setImageUrls([...imageUrls, trimmed]);
        setImageUrlInput('');
      }
    } catch {
      // Invalid URL, ignore
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const result = await createProduct.mutateAsync({
        ...data,
        description: data.description || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      router.push(`/products/${result.id}`);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="상품 제목을 입력해주세요"
          className="bg-slate-900/70 text-slate-100 placeholder:text-slate-600"
        />
        {errors.title && (
          <p className="text-sm text-rose-400">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="상품에 대한 자세한 설명을 입력해주세요"
          rows={6}
          className="bg-slate-900/70 text-slate-100 placeholder:text-slate-600"
        />
        {errors.description && (
          <p className="text-sm text-rose-400">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">가격 (원) *</Label>
          <Input
            id="price"
            type="number"
            {...register('price', { valueAsNumber: true })}
            placeholder="0"
            min={0}
            className="bg-slate-900/70 text-slate-100 placeholder:text-slate-600"
          />
          {errors.price && (
            <p className="text-sm text-rose-400">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">카테고리 *</Label>
          <Select value={category} onValueChange={(value) => setValue('category', value)}>
            <SelectTrigger className="bg-slate-900/70 text-slate-100">
              <SelectValue placeholder="카테고리를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-rose-400">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">거래 지역 *</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="예: 서울시 강남구"
          className="bg-slate-900/70 text-slate-100 placeholder:text-slate-600"
        />
        {errors.location && (
          <p className="text-sm text-rose-400">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">이미지 URL (최대 10개)</Label>
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImageUrl();
              }
            }}
            placeholder="https://picsum.photos/200/200"
            className="bg-slate-900/70 text-slate-100 placeholder:text-slate-600"
          />
          <Button
            type="button"
            onClick={addImageUrl}
            disabled={imageUrls.length >= 10}
            variant="secondary"
          >
            추가
          </Button>
        </div>
        {imageUrls.length > 0 && (
          <div className="mt-2 space-y-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 truncate text-sm text-slate-300">{url}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImageUrl(index)}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">
          이미지 URL을 입력하고 추가 버튼을 누르세요. (예: https://picsum.photos/200/200)
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={createProduct.isPending}
          className="flex-1"
        >
          {createProduct.isPending ? '등록 중...' : '상품 등록'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          취소
        </Button>
      </div>

      {createProduct.isError && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/5 p-4">
          <p className="text-sm font-medium text-rose-300">등록 실패</p>
          <p className="text-xs text-rose-200/80">
            {createProduct.error instanceof Error
              ? createProduct.error.message
              : '알 수 없는 에러가 발생했습니다.'}
          </p>
        </div>
      )}
    </form>
  );
};

