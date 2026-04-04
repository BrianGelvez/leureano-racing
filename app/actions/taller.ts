"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ordenTrabajoSchema } from "@/lib/validations";

export async function crearOrdenTrabajo(raw: unknown) {
  const parsed = ordenTrabajoSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  try {
    const orden = await prisma.$transaction(async (tx) => {
      const agg = await tx.ordenTrabajo.aggregate({ _max: { numero: true } });
      const numero = (agg._max.numero ?? 0) + 1;

      let costoRep = 0;
      const items = d.items ?? [];
      for (const it of items) {
        const p = await tx.producto.findUnique({ where: { id: it.productoId } });
        if (!p || !p.activo) throw new Error(`Producto inválido`);
        if (p.stockActual < it.cantidad)
          throw new Error(`Stock insuficiente: ${p.nombre}`);
        costoRep += it.precioUnit * it.cantidad;
      }

      const total = d.costoManoObra + costoRep;
      const ordenRow = await tx.ordenTrabajo.create({
        data: {
          numero,
          clienteId: d.clienteId ?? undefined,
          motoMarca: d.motoMarca || null,
          motoModelo: d.motoModelo || null,
          motoPatente: d.motoPatente || null,
          motoAnio: d.motoAnio ?? undefined,
          kilometraje: d.kilometraje ?? undefined,
          descripcionFalla: d.descripcionFalla,
          costoManoObra: d.costoManoObra,
          costoRepuestos: costoRep,
          total,
          estado: "RECIBIDA",
          notas: d.notas || null,
          fechaEstimada: d.fechaEstimada
            ? new Date(d.fechaEstimada)
            : undefined,
        },
      });

      await tx.ordenEstadoHistorial.create({
        data: { ordenId: ordenRow.id, estado: "RECIBIDA" },
      });

      for (const it of items) {
        await tx.itemOrdenTrabajo.create({
          data: {
            ordenId: ordenRow.id,
            productoId: it.productoId,
            cantidad: it.cantidad,
            precioUnit: it.precioUnit,
            subtotal: it.precioUnit * it.cantidad,
          },
        });
        await tx.producto.update({
          where: { id: it.productoId },
          data: { stockActual: { decrement: it.cantidad } },
        });
        await tx.movimientoStock.create({
          data: {
            productoId: it.productoId,
            tipo: "SALIDA",
            cantidad: it.cantidad,
            motivo: "USO_TALLER",
            referencia: String(ordenRow.id),
          },
        });
      }

      return ordenRow;
    });

    revalidatePath("/taller/ordenes");
    revalidatePath("/");
    revalidatePath("/productos");
    return { ok: true as const, id: orden.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear la orden";
    return { ok: false as const, message: msg };
  }
}

export async function actualizarEstadoOrden(
  ordenId: number,
  estado: string,
  extras?: { medioPago?: string; trabajoRealizado?: string }
) {
  try {
  const orden = await prisma.ordenTrabajo.update({
    where: { id: ordenId },
    data: {
      estado,
      ...(estado === "ENTREGADA"
        ? {
            fechaEntrega: new Date(),
            medioPago: extras?.medioPago ?? undefined,
            estadoPago: extras?.medioPago ? "PAGADO" : undefined,
            trabajoRealizado: extras?.trabajoRealizado ?? undefined,
          }
        : {}),
    },
  });
  await prisma.ordenEstadoHistorial.create({
    data: { ordenId, estado },
  });
  revalidatePath("/taller/ordenes");
  revalidatePath(`/taller/ordenes/${ordenId}`);
  revalidatePath("/");
  return { ok: true as const, orden };
  } catch {
    return { ok: false as const };
  }
}

export async function actualizarItemsOrden(
  ordenId: number,
  items: { productoId: number; cantidad: number; precioUnit: number }[]
) {
  await prisma.$transaction(async (tx) => {
    const old = await tx.itemOrdenTrabajo.findMany({ where: { ordenId } });
    for (const o of old) {
      await tx.producto.update({
        where: { id: o.productoId },
        data: { stockActual: { increment: o.cantidad } },
      });
      await tx.movimientoStock.create({
        data: {
          productoId: o.productoId,
          tipo: "ENTRADA",
          cantidad: o.cantidad,
          motivo: "AJUSTE_MANUAL",
          referencia: `orden-${ordenId}-edicion`,
        },
      });
    }
    await tx.itemOrdenTrabajo.deleteMany({ where: { ordenId } });

    let costoRep = 0;
    for (const it of items) {
      const p = await tx.producto.findUnique({ where: { id: it.productoId } });
      if (!p) throw new Error("Producto inválido");
      if (p.stockActual < it.cantidad) throw new Error(`Sin stock: ${p.nombre}`);
      costoRep += it.precioUnit * it.cantidad;
      await tx.itemOrdenTrabajo.create({
        data: {
          ordenId,
          productoId: it.productoId,
          cantidad: it.cantidad,
          precioUnit: it.precioUnit,
          subtotal: it.precioUnit * it.cantidad,
        },
      });
      await tx.producto.update({
        where: { id: it.productoId },
        data: { stockActual: { decrement: it.cantidad } },
      });
      await tx.movimientoStock.create({
        data: {
          productoId: it.productoId,
          tipo: "SALIDA",
          cantidad: it.cantidad,
          motivo: "USO_TALLER",
          referencia: String(ordenId),
        },
      });
    }

    const ord = await tx.ordenTrabajo.findUnique({ where: { id: ordenId } });
    if (!ord) return;
    await tx.ordenTrabajo.update({
      where: { id: ordenId },
      data: {
        costoRepuestos: costoRep,
        total: ord.costoManoObra + costoRep,
      },
    });
  });

  revalidatePath("/taller/ordenes");
  revalidatePath(`/taller/ordenes/${ordenId}`);
  revalidatePath("/productos");
  return { ok: true as const };
}
