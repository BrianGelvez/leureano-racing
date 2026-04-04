import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncargoNuevoForm } from "@/components/encargos/encargo-nuevo-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/encargos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-white">Nuevo encargo</h2>
      </div>
      {clientes.length === 0 ? (
        <p className="text-amber-400">Necesitás al menos un cliente.</p>
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
    </div>
  );
}
