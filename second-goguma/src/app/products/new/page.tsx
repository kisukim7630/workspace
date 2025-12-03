'use client';

import { ProductForm } from '@/features/products/components/product-form';

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">상품 등록</h1>
          <p className="text-sm text-slate-300">
            판매하고 싶은 상품 정보를 입력해주세요.
          </p>
        </header>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}

