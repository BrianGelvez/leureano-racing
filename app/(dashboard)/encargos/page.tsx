import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncargosTable } from "@/components/encargos/encargos-table";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function EncargosPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const encargos = await prisma.encargo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cliente: true,
      items: { include: { producto: true } },
    },
  });

  const filtered =
    searchParams.estado === "LLEGADO_AVISAR"
      ? encargos.filter((e) => e.estado === "LLEGADO_AVISAR")
      : encargos;

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Encargos" },
        ]}
      />
      <DashboardHero
        title="Encargos"
        description="Pedidos a proveedor, seguimiento y avisos al cliente cuando llega la mercadería."
        icon={<ClipboardList className="h-7 w-7 text-[#E01010]" />}
        actions={
          <Button asChild>
            <Link href="/encargos/nuevo">Nuevo encargo</Link>
          </Button>
        }
      />
      <EncargosTable encargos={filtered} />
    </DashboardPage>
  );
}
