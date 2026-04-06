import { prisma } from "@/lib/prisma";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { NuevaVentaForm } from "@/components/ventas/nueva-venta-form";
import { ShoppingCart, Sparkles } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function NuevaVentaPage() {
  const [clientes, productosRaw] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { apellido: "asc" } }),
    prisma.producto.findMany({
      where: { activo: true },
      include: {
        categoria: true,
        imagenes: { orderBy: { orden: "asc" } },
      },
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
          { href: "/ventas/historial", label: "Ventas" },
          { label: "Nueva venta" },
        ]}
      />
      <DashboardHero
        backHref="/ventas/historial"
        backLabel="Volver al historial de ventas"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            Mostrador
          </DashboardHeroBadge>
        }
        title="Nueva venta"
        description="Buscá productos, elegí lista público o revendedor, medios de pago y descuentos en un solo flujo."
        icon={<ShoppingCart className="h-7 w-7 text-[#E01010]" />}
      />
      <NuevaVentaForm clientes={clientes} productos={productos} />
    </DashboardPage>
  );
}
