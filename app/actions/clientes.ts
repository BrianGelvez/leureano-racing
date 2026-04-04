"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clienteSchema, movimientoPagoSchema } from "@/lib/validations";

export async function crearCliente(raw: unknown) {
  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  await prisma.cliente.create({
    data: {
      nombre: d.nombre,
      apellido: d.apellido,
      dni: d.dni || null,
      telefono: d.telefono || null,
      email: d.email || null,
      direccion: d.direccion || null,
      tipoCliente: d.tipoCliente,
      notas: d.notas || null,
    },
  });
  revalidatePath("/clientes");
  return { ok: true as const };
}

export async function actualizarCliente(id: number, raw: unknown) {
  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  await prisma.cliente.update({
    where: { id },
    data: {
      nombre: d.nombre,
      apellido: d.apellido,
      dni: d.dni || null,
      telefono: d.telefono || null,
      email: d.email || null,
      direccion: d.direccion || null,
      tipoCliente: d.tipoCliente,
      notas: d.notas || null,
    },
  });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true as const };
}

export async function registrarPagoCliente(raw: unknown) {
  const parsed = movimientoPagoSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const { clienteId, monto, descripcion } = parsed.data;
  await prisma.$transaction(async (tx) => {
    await tx.cliente.update({
      where: { id: clienteId },
      data: { saldoPendiente: { decrement: monto } },
    });
    await tx.movimientoCuenta.create({
      data: {
        clienteId,
        tipo: "PAGO",
        monto,
        descripcion,
      },
    });
  });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/caja");
  return { ok: true as const };
}
