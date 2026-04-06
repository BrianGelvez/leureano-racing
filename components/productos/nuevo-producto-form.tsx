"use client";

import { ProductoForm } from "@/components/productos/producto-form";
import { ImagenUploader } from "@/components/productos/ImagenUploader";

type Cat = { id: number; nombre: string };
type Prov = { id: number; nombre: string };

export function NuevoProductoForm({
  categorias,
  proveedores,
}: {
  categorias: Cat[];
  proveedores: Prov[];
}) {
  return (
    <ProductoForm
      categorias={categorias}
      proveedores={proveedores}
      postCreateStayOnPage
      renderImagenes={(id) => (
        <ImagenUploader key={id} productoId={id} imagenesIniciales={[]} />
      )}
    />
  );
}
