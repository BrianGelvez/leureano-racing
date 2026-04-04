"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { crearVentaSchema } from "@/lib/validations";
export async function crearVenta(raw: unknown) {
  const parsed = crearVentaSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      for (const it of d.items) {
        const p = await tx.producto.findUnique({ where: { id: it.productoId } });
        if (!p || !p.activo) throw new Error(`Producto inválido: ${it.productoId}`);
        if (p.stockActual < it.cantidad) {
          throw new Error(`Stock insuficiente: ${p.nombre}`);
        }
      }

      const subtotal = d.items.reduce(
        (s, it) => s + it.precioUnit * it.cantidad,
        0
      );
      let descuento = 0;
      if (d.descuentoTipo === "PORCENTAJE") {
        descuento = subtotal * (d.descuentoValor / 100);
      } else if (d.descuentoTipo === "MONTO") {
        descuento = d.descuentoValor;
      }
      const total = Math.max(0, subtotal - descuento);

      let estadoPago = "PAGADO";
      let montoPagado = total;
      if (d.medioPago === "CUENTA_CORRIENTE") {
        if (d.montoPagado >= total) {
          estadoPago = "PAGADO";
          montoPagado = total;
        } else if (d.montoPagado <= 0) {
          estadoPago = "PENDIENTE";
          montoPagado = 0;
        } else {
          estadoPago = "PARCIAL";
          montoPagado = d.montoPagado;
        }
      }

      const agg = await tx.venta.aggregate({ _max: { numero: true } });
      const numero = (agg._max.numero ?? 0) + 1;
      const venta = await tx.venta.create({
        data: {
          numero,
          clienteId: d.clienteId ?? undefined,
          subtotal,
          descuento,
          total,
          medioPago: d.medioPago,
          estadoPago,
          montoPagado,
          tipoPrecio: d.tipoPrecio,
          notas: d.notas,
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
          data: { stockActual: { decrement: it.cantidad } },
        });
        await tx.movimientoStock.create({
          data: {
            productoId: it.productoId,
            tipo: "SALIDA",
            cantidad: it.cantidad,
            motivo: "VENTA",
            referencia: String(venta.id),
          },
        });
      }

      const pendiente = total - montoPagado;
      if (pendiente > 0 && d.clienteId) {
        await tx.cliente.update({
          where: { id: d.clienteId },
          data: { saldoPendiente: { increment: pendiente } },
        });
        await tx.movimientoCuenta.create({
          data: {
            clienteId: d.clienteId,
            tipo: "CARGO",
            monto: pendiente,
            descripcion: `Venta #${venta.numero}`,
            referencia: `VENTA:${venta.id}`,
          },
        });
      }

      return venta;
    });

    revalidatePath("/");
    revalidatePath("/ventas/historial");
    revalidatePath("/productos");
    revalidatePath("/caja");
    revalidatePath("/clientes");

    return { ok: true as const, ventaId: result.id, numero: result.numero };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al registrar la venta";
    return { ok: false as const, message: msg };
  }
}

export async function guardarFacturaARCA(ventaId: number, numeroComprobante: string) {
  await prisma.venta.update({
    where: { id: ventaId },
    data: { facturaARCA: numeroComprobante },
  });
  revalidatePath("/ventas/historial");
  return { ok: true as const };
}
