import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductoForm } from "@/components/productos/producto-form";
import { ImagenUploader } from "@/components/productos/ImagenUploader";
import { ProductoEliminar } from "@/components/productos/producto-eliminar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/productos/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Editar producto</h2>
          <p className="text-white/55">{producto.nombre}</p>
        </div>
        <ProductoEliminar productoId={id} nombre={producto.nombre} />
      </div>

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
    </div>
  );
}
