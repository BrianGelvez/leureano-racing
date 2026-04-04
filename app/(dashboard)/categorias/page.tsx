import { prisma } from "@/lib/prisma";
import { CategoriasClient } from "@/components/categorias/categorias-client";

export default async function CategoriasPage() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Categorías</h2>
        <p className="text-white/55">CRUD simple de rubros</p>
      </div>
      <CategoriasClient categorias={categorias} />
    </div>
  );
}
