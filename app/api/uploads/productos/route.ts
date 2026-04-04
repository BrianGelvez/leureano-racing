import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  UPLOADS_PRODUCTOS_PUBLIC_PREFIX,
} from "@/lib/product-images";
import { deleteImageFileByPublicUrl } from "@/lib/product-image-files";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "FormData inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  const productoIdRaw = formData.get("productoId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  const productoId = Number(productoIdRaw);
  if (!Number.isFinite(productoId) || productoId < 1) {
    return NextResponse.json({ error: "productoId inválido" }, { status: 400 });
  }

  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el máximo de 5 MB" },
      { status: 400 }
    );
  }

  const mime = file.type;
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    return NextResponse.json(
      { error: "Formato no válido. Usá JPG, PNG o WebP" },
      { status: 400 }
    );
  }

  const ext = ALLOWED_IMAGE_MIME.get(mime)!;
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "productos");
  await fs.mkdir(dir, { recursive: true });
  const diskPath = path.join(dir, fileName);
  await fs.writeFile(diskPath, buffer);

  const publicUrl = `${UPLOADS_PRODUCTOS_PUBLIC_PREFIX}/${fileName}`;

  const maxOrden = await prisma.imagenProducto.aggregate({
    where: { productoId },
    _max: { orden: true },
  });
  const orden = (maxOrden._max.orden ?? -1) + 1;

  const row = await prisma.imagenProducto.create({
    data: {
      productoId,
      url: publicUrl,
      orden,
    },
  });

  revalidatePath(`/productos/${productoId}`);
  revalidatePath(`/productos/${productoId}/editar`);
  revalidatePath("/productos");
  revalidatePath("/");

  return NextResponse.json({
    id: row.id,
    url: row.url,
    orden: row.orden,
    productoId: row.productoId,
    createdAt: row.createdAt.toISOString(),
  });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { imagenId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const imagenId = Number(body.imagenId);
  if (!Number.isFinite(imagenId) || imagenId < 1) {
    return NextResponse.json({ error: "imagenId inválido" }, { status: 400 });
  }

  const img = await prisma.imagenProducto.findUnique({ where: { id: imagenId } });
  if (!img) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  await deleteImageFileByPublicUrl(img.url);
  await prisma.imagenProducto.delete({ where: { id: imagenId } });

  const restantes = await prisma.imagenProducto.findMany({
    where: { productoId: img.productoId },
    orderBy: { orden: "asc" },
  });
  await prisma.$transaction(
    restantes.map((r, i) =>
      prisma.imagenProducto.update({
        where: { id: r.id },
        data: { orden: i },
      })
    )
  );

  revalidatePath(`/productos/${img.productoId}`);
  revalidatePath(`/productos/${img.productoId}/editar`);
  revalidatePath("/productos");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
