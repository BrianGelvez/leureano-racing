"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function reordenarImagenesProducto(
  productoId: number,
  idsEnOrden: number[]
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, error: "No autorizado" };

  const existentes = await prisma.imagenProducto.findMany({
    where: { productoId },
    select: { id: true },
  });
  const setEsperado = new Set(existentes.map((e) => e.id));
  if (idsEnOrden.length !== setEsperado.size) {
    return { ok: false as const, error: "Lista inválida" };
  }
  for (const id of idsEnOrden) {
    if (!setEsperado.has(id)) {
      return { ok: false as const, error: "ID inválido" };
    }
  }

  await prisma.$transaction(
    idsEnOrden.map((id, orden) =>
      prisma.imagenProducto.update({
        where: { id },
        data: { orden },
      })
    )
  );

  revalidatePath(`/productos/${productoId}`);
  revalidatePath(`/productos/${productoId}/editar`);
  revalidatePath("/productos");
  revalidatePath("/");
  return { ok: true as const };
}
