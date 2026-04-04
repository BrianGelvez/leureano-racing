import { prisma } from "@/lib/prisma";
import { VentasHistorialTable } from "@/components/ventas/ventas-historial-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VentasHistorialPage() {
  const ventas = await prisma.venta.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { cliente: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Historial de ventas</h2>
          <p className="text-white/55">Últimas 100 operaciones</p>
        </div>
        <Button asChild>
          <Link href="/ventas/nueva">Nueva venta</Link>
        </Button>
      </div>
      <VentasHistorialTable ventas={ventas} />
    </div>
  );
}
