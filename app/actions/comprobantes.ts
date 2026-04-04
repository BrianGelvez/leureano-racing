"use server";

import { prisma } from "@/lib/prisma";

export async function getVentaComprobanteData(ventaId: number) {
  const venta = await prisma.venta.findUnique({
    where: { id: ventaId },
    include: {
      cliente: true,
      items: { include: { producto: true } },
    },
  });
  const negocio = await prisma.configuracionNegocio.findUnique({
    where: { id: 1 },
  });
  if (!venta) return null;
  return { venta, negocio };
}

export async function getOrdenComprobanteData(ordenId: number) {
  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: ordenId },
    include: {
      cliente: true,
      items: { include: { producto: true } },
    },
  });
  const negocio = await prisma.configuracionNegocio.findUnique({
    where: { id: 1 },
  });
  if (!orden) return null;
  return { orden, negocio };
}
