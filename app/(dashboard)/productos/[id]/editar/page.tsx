import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductoForm } from "@/components/productos/producto-form";
import { ImagenUploader } from "@/components/productos/ImagenUploader";
import { ProductoEliminar } from "@/components/productos/producto-eliminar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Sparkles } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const [producto, categorias, proveedores] = await Promise.all([
    prisma.producto.findUnique({
      where: { id },
      include: {
        imagenes: { orderBy: { orden: "asc" } },
      },
    }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  if (!producto) notFound();

  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/productos", label: "Productos" },
          { href: `/productos/${id}`, label: producto.nombre },
          { label: "Editar" },
        ]}
      />
      <DashboardHero
        backHref={`/productos/${id}`}
        backLabel="Volver a la ficha del producto"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            Edición
          </DashboardHeroBadge>
        }
        title="Editar producto"
        description={producto.nombre}
        icon={<Package className="h-7 w-7 text-[#E01010]" />}
        actions={<ProductoEliminar productoId={id} nombre={producto.nombre} />}
      />

      <ProductoForm
        categorias={categorias}
        proveedores={proveedores}
        productoId={producto.id}
        redirectAfterUpdate={`/productos/${id}`}
        defaultValues={{
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? undefined,
          codigo: producto.codigo ?? undefined,
          categoriaId: producto.categoriaId,
          proveedorId: producto.proveedorId,
          stockActual: producto.stockActual,
          stockMinimo: producto.stockMinimo,
          precioCompra: producto.precioCompra,
          precioPublico: producto.precioPublico,
          precioRevendedor: producto.precioRevendedor,
          marca: producto.marca ?? undefined,
          compatibilidad: producto.compatibilidad ?? undefined,
          activo: producto.activo,
        }}
        extraBeforeSubmit={
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle>Imágenes del producto</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagenUploader
                productoId={producto.id}
                imagenesIniciales={producto.imagenes}
              />
            </CardContent>
          </Card>
        }
      />
    </DashboardPage>
  );
}
