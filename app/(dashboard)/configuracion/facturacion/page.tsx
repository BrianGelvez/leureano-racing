import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles } from "lucide-react";
import { ConfigForm } from "@/components/config/config-form";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function FacturacionConfigPage() {
  const cfg = await prisma.configuracionNegocio.findUnique({ where: { id: 1 } });

  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/configuracion", label: "Configuración" },
          { label: "Facturación ARCA" },
        ]}
      />
      <DashboardHero
        backHref="/configuracion"
        backLabel="Volver a configuración"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            ARCA
          </DashboardHeroBadge>
        }
        title="Facturación ARCA"
        description={
          <>
            Preparado para certificado .p12 y web services. Referencia técnica en{" "}
            <code className="text-white/70">lib/arca.ts</code>.
          </>
        }
        icon={<FileText className="h-7 w-7 text-[#E01010]" />}
      />

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Certificado digital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/65">
          <p>
            En la versión con integración real, aquí se subirá el archivo .p12 y la clave
            de forma segura (variables de entorno / almacenamiento cifrado).
          </p>
          <p className="rounded-lg border border-dashed border-white/15 p-4 text-white/45">
            MVP: sin almacenamiento de certificados todavía.
          </p>
        </CardContent>
      </Card>

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
    </DashboardPage>
  );
}
