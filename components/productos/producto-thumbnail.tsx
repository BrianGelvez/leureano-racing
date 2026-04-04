"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductoThumbnail({
  src,
  size = 40,
  rounded = "full",
  className,
  alt = "",
}: {
  src?: string | null;
  size?: number;
  /** full = círculo, md = redondeado tipo card */
  rounded?: "full" | "md";
  className?: string;
  alt?: string;
}) {
  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-lg";

  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm",
          roundedClass,
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <ImageIcon
          className="text-white/35"
          style={{ width: size * 0.45, height: size * 0.45 }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border border-white/[0.08] bg-black/40",
        roundedClass,
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        unoptimized={false}
      />
    </div>
  );
}
