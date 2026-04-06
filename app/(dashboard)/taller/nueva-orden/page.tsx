import { prisma } from "@/lib/prisma";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { NuevaOrdenForm } from "@/components/taller/nueva-orden-form";
import { Wrench, Sparkles } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function NuevaOrdenPage() {
  const [clientes, productosRaw] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { apellido: "asc" } }),
    prisma.producto.findMany({
      where: { activo: true },
      include: { imagenes: { orderBy: { orden: "asc" } } },
      orderBy: { nombre: "asc" },
    }),
  ]);

  const productos = productosRaw.map((p) => ({
    ...p,
    imagenPrincipal: imagenPrincipalUrl(p.imagenes),
  }));

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/taller/ordenes", label: "Taller" },
          { label: "Nueva orden" },
        ]}
      />
      <DashboardHero
        backHref="/taller/ordenes"
        backLabel="Volver a órdenes de taller"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            Ingreso
          </DashboardHeroBadge>
        }
        title="Nueva orden de trabajo"
        description="Cliente, moto, falla declarada y repuestos con stock en vivo."
        icon={<Wrench className="h-7 w-7 text-[#E01010]" />}
      />
      <NuevaOrdenForm clientes={clientes} productos={productos} />
    </DashboardPage>
  );
}
