import { prisma } from "@/lib/prisma";

export async function nextVentaNumero() {
  const agg = await prisma.venta.aggregate({ _max: { numero: true } });
  return (agg._max.numero ?? 0) + 1;
}

export async function nextOrdenNumero() {
  const agg = await prisma.ordenTrabajo.aggregate({ _max: { numero: true } });
  return (agg._max.numero ?? 0) + 1;
}
