import { prisma } from "@/lib/prisma";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { ProductosTable } from "@/components/productos/productos-table";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Productos</h2>
        <p className="text-white/55">Stock, precios y categorías</p>
      </div>
      <ProductosTable
        data={rows}
        categorias={categorias}
        initialStockFilter={searchParams.stock}
      />
    </div>
  );
}
