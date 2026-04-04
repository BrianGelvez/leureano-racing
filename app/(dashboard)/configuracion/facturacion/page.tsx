import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ConfigForm } from "@/components/config/config-form";

export default async function FacturacionConfigPage() {
  const cfg = await prisma.configuracionNegocio.findUnique({ where: { id: 1 } });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Facturación ARCA</h2>
          <p className="text-white/55">
            Preparado para certificado .p12 y WS — ver <code className="text-white/70">lib/arca.ts</code>
          </p>
        </div>
      </div>

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
    </div>
  );
}
