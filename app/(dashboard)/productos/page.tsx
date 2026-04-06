import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { ProductosTable } from "@/components/productos/productos-table";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { stock?: string };
}) {
  const [productos, categorias] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true },
      include: {
        categoria: true,
        imagenes: { orderBy: { orden: "asc" } },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const rows = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    codigo: p.codigo,
    stockActual: p.stockActual,
    stockMinimo: p.stockMinimo,
    precioPublico: p.precioPublico,
    precioRevendedor: p.precioRevendedor,
    categoriaId: p.categoriaId,
    categoria: p.categoria,
    imagenPrincipal: imagenPrincipalUrl(p.imagenes),
  }));

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Productos" },
        ]}
      />
      <DashboardHero
        title="Productos"
        description="Stock, precios por canal, categorías e imágenes. Filtrá por stock bajo desde la tabla."
        icon={<Package className="h-7 w-7 text-[#E01010]" />}
        actions={
          <Button asChild>
            <Link href="/productos/nuevo">Nuevo producto</Link>
          </Button>
        }
      />
      <ProductosTable
        data={rows}
        categorias={categorias}
        initialStockFilter={searchParams.stock}
      />
    </DashboardPage>
  );
}
