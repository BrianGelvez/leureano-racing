import { prisma } from "@/lib/prisma";
import { ConfigForm } from "@/components/config/config-form";

export default async function ConfigPage() {
  const cfg = await prisma.configuracionNegocio.findUnique({ where: { id: 1 } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configuración</h2>
        <p className="text-white/55">Datos del negocio</p>
      </div>
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
        Logo: colocá tu archivo en <code className="text-white/70">/public/logo.png</code>{" "}
        (ya incluido en el MVP).
      </p>
    </div>
  );
}
