import { prisma } from "@/lib/prisma";
import { ConfigForm } from "@/components/config/config-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function ConfigPage() {
  const cfg = await prisma.configuracionNegocio.findUnique({ where: { id: 1 } });

  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Configuración" },
        ]}
      />
      <DashboardHero
        title="Configuración"
        description="Nombre del negocio, datos fiscales y contacto. Se usan en comprobantes y pantallas."
        icon={<Settings className="h-7 w-7 text-[#E01010]" />}
        actions={
          <Button variant="outline" asChild>
            <Link href="/configuracion/facturacion">Facturación ARCA</Link>
          </Button>
        }
      />
      <ConfigForm
        defaultValues={{
          nombreNegocio: cfg?.nombreNegocio ?? "Laureano Racing",
          cuit: cfg?.cuit ?? "",
          direccion: cfg?.direccion ?? "",
          telefono: cfg?.telefono ?? "",
          email: cfg?.email ?? "",
          condicionIVA: cfg?.condicionIVA ?? "",
          ptoVentaARCA: cfg?.ptoVentaARCA ?? null,
        }}
      />
      <p className="text-sm text-white/45">
        Logo: colocá tu archivo en{" "}
        <code className="text-white/70">/public/logo.png</code> (ya incluido en el MVP).
      </p>
    </DashboardPage>
  );
}
