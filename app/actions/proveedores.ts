"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { proveedorSchema } from "@/lib/validations";

export async function crearProveedor(raw: unknown) {
  const parsed = proveedorSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  await prisma.proveedor.create({
    data: {
      nombre: d.nombre,
      contacto: d.contacto || null,
      telefono: d.telefono || null,
      email: d.email || null,
      notas: d.notas || null,
    },
  });
  revalidatePath("/proveedores");
  return { ok: true as const };
}
