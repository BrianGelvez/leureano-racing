"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productoSchema, ajusteStockSchema, categoriaSchema } from "@/lib/validations";
import { deleteImageFileByPublicUrl } from "@/lib/product-image-files";

export async function crearProducto(raw: unknown) {
  const parsed = productoSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  const created = await prisma.producto.create({
    data: {
      nombre: d.nombre,
      descripcion: d.descripcion || null,
      codigo: d.codigo || null,
      categoriaId: d.categoriaId,
      proveedorId: d.proveedorId ?? null,
      stockActual: d.stockActual,
      stockMinimo: d.stockMinimo,
      precioCompra: d.precioCompra,
      precioPublico: d.precioPublico,
      precioRevendedor: d.precioRevendedor,
      marca: d.marca || null,
      compatibilidad: d.compatibilidad || null,
      activo: d.activo ?? true,
    },
  });
  revalidatePath("/productos");
  return { ok: true as const, id: created.id };
}

export async function actualizarProducto(id: number, raw: unknown) {
  const parsed = productoSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  await prisma.producto.update({
    where: { id },
    data: {
      nombre: d.nombre,
      descripcion: d.descripcion || null,
      codigo: d.codigo || null,
      categoriaId: d.categoriaId,
      proveedorId: d.proveedorId ?? null,
      stockActual: d.stockActual,
      stockMinimo: d.stockMinimo,
      precioCompra: d.precioCompra,
      precioPublico: d.precioPublico,
      precioRevendedor: d.precioRevendedor,
      marca: d.marca || null,
      compatibilidad: d.compatibilidad || null,
      activo: d.activo ?? true,
    },
  });
  revalidatePath("/productos");
  revalidatePath(`/productos/${id}`);
  revalidatePath(`/productos/${id}/editar`);
  return { ok: true as const };
}

export async function eliminarProducto(id: number) {
  try {
    const imagenes = await prisma.imagenProducto.findMany({
      where: { productoId: id },
    });
    for (const im of imagenes) {
      await deleteImageFileByPublicUrl(im.url);
    }
    await prisma.producto.delete({ where: { id } });
    revalidatePath("/productos");
    revalidatePath("/");
    revalidatePath("/reportes");
    revalidatePath(`/productos/${id}`);
    revalidatePath(`/productos/${id}/editar`);
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}

export async function ajustarStockManual(raw: unknown) {
  const parsed = ajusteStockSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const { productoId, nuevoStock, motivo } = parsed.data;
  const prod = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!prod) return { ok: false as const, message: "Producto no encontrado" };
  const diff = nuevoStock - prod.stockActual;
  await prisma.$transaction([
    prisma.producto.update({
      where: { id: productoId },
      data: { stockActual: nuevoStock },
    }),
    prisma.movimientoStock.create({
      data: {
        productoId,
        tipo: diff >= 0 ? "ENTRADA" : "SALIDA",
        cantidad: Math.abs(diff),
        motivo: "AJUSTE_MANUAL",
        referencia: motivo.slice(0, 200),
      },
    }),
  ]);
  revalidatePath("/productos");
  revalidatePath(`/productos/${productoId}`);
  revalidatePath("/");
  return { ok: true as const };
}

export async function crearCategoriaRapida(raw: unknown) {
  const parsed = categoriaSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const c = await prisma.categoria.create({ data: { nombre: parsed.data.nombre } });
  revalidatePath("/categorias");
  revalidatePath("/productos");
  return { ok: true as const, id: c.id };
}
