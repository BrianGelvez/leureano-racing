"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encargoSchema } from "@/lib/validations";
import { ESTADOS_ENCARGO_VALIDOS } from "@/lib/encargos-estados";

export async function crearEncargo(raw: unknown) {
  const parsed = encargoSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  await prisma.encargo.create({
    data: {
      clienteId: d.clienteId,
      notas: d.notas || null,
      items: {
        create: d.items.map((it) => ({
          productoId: it.productoId ?? null,
          descripcion: it.descripcion,
          cantidad: it.cantidad,
        })),
      },
    },
  });
  revalidatePath("/encargos");
  revalidatePath("/");
  return { ok: true as const };
}

export async function actualizarEstadoEncargo(id: number, estado: string) {
  if (!ESTADOS_ENCARGO_VALIDOS.includes(estado)) {
    return { ok: false as const, message: "Estado inválido" };
  }
  const e = await prisma.encargo.findUnique({ where: { id } });
  if (!e) return { ok: false as const, message: "No encontrado" };
  await prisma.encargo.update({ where: { id }, data: { estado } });
  revalidatePath("/encargos");
  revalidatePath("/");
  revalidatePath(`/clientes/${e.clienteId}`);
  return { ok: true as const, estado };
}
