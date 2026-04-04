"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ImagenProductoDTO } from "@/lib/product-images";
import { ALLOWED_IMAGE_MIME, MAX_IMAGE_BYTES } from "@/lib/product-images";
import { reordenarImagenesProducto } from "@/app/actions/imagenes-producto";

export interface ImagenUploaderProps {
  productoId: number;
  imagenesIniciales: ImagenProductoDTO[];
  onChange?: (imagenes: ImagenProductoDTO[]) => void;
}

function sortImgs(list: ImagenProductoDTO[]) {
  return [...list].sort((a, b) => a.orden - b.orden);
}

function toDto(row: {
  id: number;
  url: string;
  orden: number;
  productoId: number;
  createdAt: string | Date;
}): ImagenProductoDTO {
  return {
    id: row.id,
    url: row.url,
    orden: row.orden,
    productoId: row.productoId,
    createdAt: row.createdAt,
  };
}

export function ImagenUploader({
  productoId,
  imagenesIniciales,
  onChange,
}: ImagenUploaderProps) {
  const router = useRouter();
  const [imagenes, setImagenes] = React.useState(() =>
    sortImgs(imagenesIniciales)
  );
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [draggingId, setDraggingId] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImagenes(sortImgs(imagenesIniciales));
  }, [imagenesIniciales]);

  const notify = React.useCallback(
    (next: ImagenProductoDTO[]) => {
      onChange?.(next);
    },
    [onChange]
  );

  function validateFile(file: File): string | null {
    if (file.size > MAX_IMAGE_BYTES) {
      return "El archivo supera el máximo de 5 MB";
    }
    if (!ALLOWED_IMAGE_MIME.has(file.type)) {
      return "Formato no válido. Usá JPG, PNG o WebP";
    }
    return null;
  }

  async function uploadFile(file: File) {
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("productoId", String(productoId));
      const res = await fetch("/api/uploads/productos", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Error al subir");
        return;
      }
      const row = toDto({
        id: data.id,
        url: data.url,
        orden: data.orden,
        productoId: data.productoId ?? productoId,
        createdAt: data.createdAt,
      });
      setImagenes((prev) => {
        const next = sortImgs([...prev, row]);
        notify(next);
        return next;
      });
      toast.success("Imagen subida");
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function eliminar(id: number) {
    const res = await fetch("/api/uploads/productos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagenId: id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(typeof data.error === "string" ? data.error : "Error al eliminar");
      return;
    }
    setImagenes((prev) => {
      const next = sortImgs(prev.filter((i) => i.id !== id));
      notify(next);
      return next;
    });
    toast.success("Imagen eliminada");
    router.refresh();
  }

  async function aplicarOrden(nuevaLista: ImagenProductoDTO[]) {
    const ids = nuevaLista.map((i) => i.id);
    const r = await reordenarImagenesProducto(productoId, ids);
    if (!r.ok) {
      toast.error("No se pudo reordenar");
      router.refresh();
      return;
    }
    const normalizada = nuevaLista.map((im, orden) => ({ ...im, orden }));
    setImagenes(normalizada);
    notify(normalizada);
    router.refresh();
  }

  function onDropFiles(files: FileList | null) {
    if (!files?.length) return;
    void uploadFile(files[0]);
  }

  function handleDragStart(id: number) {
    setDraggingId(id);
  }

  function handleDragOver(e: React.DragEvent, targetId: number) {
    e.preventDefault();
    if (draggingId == null || draggingId === targetId) return;
  }

  async function handleDrop(targetId: number) {
    if (draggingId == null || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    const list = [...imagenes];
    const from = list.findIndex((i) => i.id === draggingId);
    const to = list.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) {
      setDraggingId(null);
      return;
    }
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setDraggingId(null);
    await aplicarOrden(list);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void uploadFile(f);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOver(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (uploading) return;
          onDropFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200",
          "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]",
          dragOver &&
            "border-[#E01010] bg-[rgba(224,16,16,0.05)] shadow-[0_0_20px_rgba(224,16,16,0.15)]"
        )}
      >
        {uploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-[#E01010]" />
          </div>
        )}
        <p className="text-sm font-medium text-white/85">
          Arrastrá una imagen aquí o hacé click para elegir
        </p>
        <p className="mt-1 text-xs text-white/45">
          JPG, PNG o WebP · máx. 5 MB · se sube automáticamente
        </p>
      </div>

      {imagenes.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-white/50">
            Arrastrá las miniaturas para ordenar. La primera es la principal.
          </p>
          <div className="flex flex-wrap gap-3">
            {imagenes.map((im, index) => (
              <div
                key={im.id}
                draggable
                onDragStart={() => handleDragStart(im.id)}
                onDragOver={(e) => handleDragOver(e, im.id)}
                onDrop={() => void handleDrop(im.id)}
                className={cn(
                  "group relative h-24 w-24 cursor-grab overflow-hidden rounded-[10px] border border-white/[0.08] active:cursor-grabbing"
                )}
              >
                <Image
                  src={im.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={false}
                />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-[#E01010] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void eliminar(im.id);
                  }}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-[#E01010] group-hover:opacity-100"
                  aria-label="Eliminar imagen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
