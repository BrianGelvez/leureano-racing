import { ProveedorForm } from "@/components/proveedores/proveedor-form";
import { Truck, Sparkles } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default function NuevoProveedorPage() {
  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/proveedores", label: "Proveedores" },
          { label: "Nuevo" },
        ]}
      />
      <DashboardHero
        backHref="/proveedores"
        backLabel="Volver a proveedores"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            Alta
          </DashboardHeroBadge>
        }
        title="Nuevo proveedor"
        description="Datos de contacto y notas. Luego podés asociar productos y registrar compras."
        icon={<Truck className="h-7 w-7 text-[#E01010]" />}
      />
      <ProveedorForm />
    </DashboardPage>
  );
}
