import { prisma } from "@/lib/prisma";
import { VentasHistorialTable } from "@/components/ventas/ventas-historial-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function VentasHistorialPage() {
  const ventas = await prisma.venta.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { cliente: true },
  });

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Historial de ventas" },
        ]}
      />
      <DashboardHero
        title="Historial de ventas"
        description="Últimas 100 operaciones con cliente, totales y detalle para consulta rápida."
        icon={<ShoppingCart className="h-7 w-7 text-[#E01010]" />}
        actions={
          <Button asChild>
            <Link href="/ventas/nueva">Nueva venta</Link>
          </Button>
        }
      />
      <VentasHistorialTable ventas={ventas} />
    </DashboardPage>
  );
}
