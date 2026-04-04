import { prisma } from "@/lib/prisma";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { NuevaVentaForm } from "@/components/ventas/nueva-venta-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ventas/historial">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Nueva venta</h2>
          <p className="text-white/55">Mostrador — venta rápida</p>
        </div>
      </div>
      <NuevaVentaForm clientes={clientes} productos={productos} />
    </div>
  );
}
