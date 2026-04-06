import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncargoNuevoForm } from "@/components/encargos/encargo-nuevo-form";
import { Button } from "@/components/ui/button";
import { ClipboardList, Sparkles } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardCallout,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function EncargoNuevoPage({
  searchParams,
}: {
  searchParams: { productoId?: string };
}) {
  const [clientes, productos] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { apellido: "asc" } }),
    prisma.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  const defaultProductoId = searchParams.productoId
    ? Number(searchParams.productoId)
    : undefined;

  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/encargos", label: "Encargos" },
          { label: "Nuevo" },
        ]}
      />
      <DashboardHero
        backHref="/encargos"
        backLabel="Volver a encargos"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            Alta
          </DashboardHeroBadge>
        }
        title="Nuevo encargo"
        description="Asociá cliente e ítems. Si venís desde stock bajo, el producto puede venir preseleccionado."
        icon={<ClipboardList className="h-7 w-7 text-[#E01010]" />}
      />

      {clientes.length === 0 ? (
        <DashboardCallout
          title="Necesitás al menos un cliente para crear un encargo."
          description="Creá un cliente desde la sección Clientes y volvé acá."
          action={
            <Button asChild>
              <Link href="/clientes/nuevo">Nuevo cliente</Link>
            </Button>
          }
        />
      ) : (
        <EncargoNuevoForm
          clientes={clientes}
          productos={productos}
          defaultProductoId={
            defaultProductoId && !Number.isNaN(defaultProductoId)
              ? defaultProductoId
              : undefined
          }
        />
      )}
    </DashboardPage>
  );
}
