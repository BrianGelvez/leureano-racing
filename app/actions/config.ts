"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { configNegocioSchema } from "@/lib/validations";

export async function guardarConfiguracion(raw: unknown) {
  const parsed = configNegocioSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  await prisma.configuracionNegocio.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      nombreNegocio: d.nombreNegocio,
      cuit: d.cuit || null,
      direccion: d.direccion || null,
      telefono: d.telefono || null,
      email: d.email || null,
      condicionIVA: d.condicionIVA || null,
      ptoVentaARCA: d.ptoVentaARCA ?? null,
    },
    update: {
      nombreNegocio: d.nombreNegocio,
      cuit: d.cuit || null,
      direccion: d.direccion || null,
      telefono: d.telefono || null,
      email: d.email || null,
      condicionIVA: d.condicionIVA || null,
      ptoVentaARCA: d.ptoVentaARCA ?? null,
    },
  });
  revalidatePath("/configuracion");
  return { ok: true as const };
}
