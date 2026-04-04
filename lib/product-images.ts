export const UPLOADS_PRODUCTOS_PUBLIC_PREFIX = "/uploads/productos";

export type ImagenProductoDTO = {
  id: number;
  productoId: number;
  url: string;
  orden: number;
  createdAt: Date | string;
};

export function imagenPrincipalUrl(
  imagenes?: Pick<ImagenProductoDTO, "url" | "orden">[] | null
): string | null {
  if (!imagenes?.length) return null;
  const sorted = [...imagenes].sort((a, b) => a.orden - b.orden);
  return sorted[0]?.url ?? null;
}

export const ALLOWED_IMAGE_MIME = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
