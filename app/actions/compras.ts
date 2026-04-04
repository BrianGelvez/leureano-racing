"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { compraSchema } from "@/lib/validations";

export async function registrarCompra(raw: unknown) {
  const parsed = compraSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  const total = d.items.reduce((s, it) => s + it.precioUnit * it.cantidad, 0);

  await prisma.$transaction(async (tx) => {
    const compra = await tx.compra.create({
      data: {
        proveedorId: d.proveedorId,
        total,
        notas: d.notas || null,
        estado: "RECIBIDA",
        items: {
          create: d.items.map((it) => ({
            productoId: it.productoId,
            cantidad: it.cantidad,
            precioUnit: it.precioUnit,
            subtotal: it.precioUnit * it.cantidad,
          })),
        },
      },
    });

    for (const it of d.items) {
      await tx.producto.update({
        where: { id: it.productoId },
        data: {
          stockActual: { increment: it.cantidad },
          precioCompra: it.precioUnit,
        },
      });
      await tx.movimientoStock.create({
        data: {
          productoId: it.productoId,
          tipo: "ENTRADA",
          cantidad: it.cantidad,
          motivo: "COMPRA",
          referencia: String(compra.id),
        },
      });
    }
  });

  revalidatePath("/proveedores");
  revalidatePath("/productos");
  revalidatePath("/");
  return { ok: true as const };
}
