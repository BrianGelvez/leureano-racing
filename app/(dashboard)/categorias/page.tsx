import { prisma } from "@/lib/prisma";
import { CategoriasClient } from "@/components/categorias/categorias-client";
import { Tag } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function CategoriasPage() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Categorías" },
        ]}
      />
      <DashboardHero
        title="Categorías"
        description="Rubros para organizar productos. No podés borrar una categoría que tenga productos asociados."
        icon={<Tag className="h-7 w-7 text-[#E01010]" />}
      />
      <CategoriasClient categorias={categorias} />
    </DashboardPage>
  );
}
