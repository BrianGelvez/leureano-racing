import { prisma } from "@/lib/prisma";
import { ProductoForm } from "@/components/productos/producto-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NuevoProductoPage() {
  const [categorias, proveedores] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Nuevo producto</h2>
          <p className="text-white/55">Alta de repuesto o accesorio</p>
        </div>
      </div>
      {categorias.length === 0 ? (
        <p className="text-amber-400">
          Primero creá al menos una categoría en Categorías.
        </p>
      ) : (
        <ProductoForm categorias={categorias} proveedores={proveedores} />
      )}
    </div>
  );
}
