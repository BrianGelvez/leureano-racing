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
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Proveedores</h2>
          <p className="text-white/55">Compras y contacto</p>
        </div>
        <Button asChild>
          <Link href="/proveedores/nuevo">Nuevo proveedor</Link>
        </Button>
      </div>

      {proveedores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16">
          <Truck className="mb-3 h-12 w-12 text-white/25" />
          <p className="text-white/55">Sin proveedores.</p>
        </div>
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
    </div>
  );
}
