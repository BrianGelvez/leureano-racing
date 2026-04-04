"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categoriaSchema } from "@/lib/validations";

export async function crearCategoria(raw: unknown) {
  const parsed = categoriaSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  await prisma.categoria.create({ data: { nombre: parsed.data.nombre } });
  revalidatePath("/categorias");
  revalidatePath("/productos");
  return { ok: true as const };
}

export async function eliminarCategoria(id: number) {
  const count = await prisma.producto.count({ where: { categoriaId: id } });
  if (count > 0) {
    return {
      ok: false as const,
      message: "No se puede eliminar: hay productos en esta categoría",
    };
  }
  await prisma.categoria.delete({ where: { id } });
  revalidatePath("/categorias");
  return { ok: true as const };
}
