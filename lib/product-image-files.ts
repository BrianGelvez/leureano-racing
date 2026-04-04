import path from "path";
import fs from "fs/promises";
import { UPLOADS_PRODUCTOS_PUBLIC_PREFIX } from "@/lib/product-images";

/** Ruta absoluta en disco para una URL pública que empiece con /uploads/ */
export function publicUrlToAbsoluteFilePath(url: string): string {
  const normalized = url.startsWith("/") ? url.slice(1) : url;
  return path.join(process.cwd(), "public", normalized);
}

export async function deleteImageFileByPublicUrl(url: string): Promise<void> {
  if (!url.startsWith(UPLOADS_PRODUCTOS_PUBLIC_PREFIX)) return;
  const abs = publicUrlToAbsoluteFilePath(url);
  try {
    await fs.unlink(abs);
  } catch (e: unknown) {
    const code = (e as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT") throw e;
  }
}
