"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ImagenProductoDTO } from "@/lib/product-images";

export function ProductoGaleria({ imagenes }: { imagenes: ImagenProductoDTO[] }) {
  const sorted = [...imagenes].sort((a, b) => a.orden - b.orden);
  const [idx, setIdx] = useState(0);

  if (sorted.length === 0) {
    return null;
  }

  const principal = sorted[idx] ?? sorted[0];

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative aspect-[16/10] w-full max-h-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-black/30"
        )}
      >
        <Image
          src={principal.url}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          unoptimized={false}
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {sorted.map((im, i) => (
            <button
              key={im.id}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-lg border transition-all duration-200",
                i === idx
                  ? "border-[#E01010] ring-2 ring-[#E01010]/40"
                  : "border-white/[0.08] opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={im.url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
