"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProductResponse } from "../lib/dto";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale/ko";

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const timeAgo = formatDistanceToNow(new Date(product.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={product.imageUrls[0] || "https://picsum.photos/400/300"}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold">
            {product.title}
          </h3>
          <p className="mb-3 text-2xl font-bold text-primary">
            {product.price.toLocaleString()}원
          </p>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.location}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

