import { prisma } from "@/lib/prisma";
import { NuevoProductoForm } from "@/components/productos/nuevo-producto-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Sparkles } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardCallout,
  DashboardHero,
  DashboardHeroBadge,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function NuevoProductoPage() {
  const [categorias, proveedores] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/productos", label: "Productos" },
          { label: "Nuevo" },
        ]}
      />

      <DashboardHero
        backHref="/productos"
        backLabel="Volver a productos"
        badge={
          <DashboardHeroBadge icon={<Sparkles className="h-3 w-3" aria-hidden />}>
            Alta
          </DashboardHeroBadge>
        }
        title="Nuevo producto"
        description="Cargá repuesto o accesorio, definí precios y stock. Después de crearlo podés agregar fotos en el mismo paso, sin ir a otra pantalla."
        icon={<Package className="h-7 w-7 text-[#E01010]" />}
        steps={[
          {
            step: 1,
            title: "Datos y precios",
            subtitle: "Completá el formulario y tocá Crear producto.",
            tone: "active",
          },
          {
            step: 2,
            title: "Imágenes",
            subtitle: "Subí la portada y más fotos para la ficha.",
            tone: "muted",
          },
        ]}
      />

      {categorias.length === 0 ? (
        <DashboardCallout
          title="Necesitás al menos una categoría para dar de alta un producto."
          description="Creá categorías desde el menú y volvé acá."
          action={
            <Button asChild>
              <Link href="/categorias">Ir a categorías</Link>
            </Button>
          }
        />
      ) : (
        <NuevoProductoForm categorias={categorias} proveedores={proveedores} />
      )}
    </DashboardPage>
  );
}
