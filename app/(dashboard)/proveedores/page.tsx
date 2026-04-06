import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProveedorCompraDialog } from "@/components/proveedores/proveedor-compra-dialog";
import { Truck } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardEmptyState,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function ProveedoresPage() {
  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Proveedores" },
        ]}
      />
      <DashboardHero
        title="Proveedores"
        description="Contacto, compras rápidas y productos vinculados. Registrá compras desde la tabla."
        icon={<Truck className="h-7 w-7 text-[#E01010]" />}
        actions={
          <Button asChild>
            <Link href="/proveedores/nuevo">Nuevo proveedor</Link>
          </Button>
        }
      />

      {proveedores.length === 0 ? (
        <DashboardEmptyState
          icon={<Truck className="h-12 w-12" />}
          title="Sin proveedores cargados"
          description="Agregá proveedores para asociarlos a productos y registrar compras."
          action={
            <Button asChild>
              <Link href="/proveedores/nuevo">Nuevo proveedor</Link>
            </Button>
          }
        />
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-white/60">{p.telefono ?? "—"}</TableCell>
                  <TableCell className="text-white/60">{p.email ?? "—"}</TableCell>
                  <TableCell>{p._count.productos}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/proveedores/${p.id}`}>Ver</Link>
                      </Button>
                      <ProveedorCompraDialog proveedor={p} productos={productos} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardPage>
  );
}
