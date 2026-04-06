import { ClienteForm } from "@/components/clientes/cliente-form";
import { Users, Sparkles } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default function NuevoClientePage() {
  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/clientes", label: "Clientes" },
          { label: "Nuevo" },
        ]}
      />
      <DashboardHero
        backHref="/clientes"
        backLabel="Volver a clientes"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            Alta
          </DashboardHeroBadge>
        }
        title="Nuevo cliente"
        description="Datos de contacto, tipo de lista de precios y notas internas. Podés editar todo después desde la ficha."
        icon={<Users className="h-7 w-7 text-[#E01010]" />}
      />
      <ClienteForm />
    </DashboardPage>
  );
}
