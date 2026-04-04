import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductoAjusteStock } from "@/components/productos/producto-ajuste-stock";
import { ProductoGaleria } from "@/components/productos/producto-galeria";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function ProductoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const [producto, movs, ventasMes] = await Promise.all([
    prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        proveedor: true,
        imagenes: { orderBy: { orden: "asc" } },
      },
    }),
    prisma.movimientoStock.findMany({
      where: { productoId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.itemVenta.aggregate({
      where: {
        productoId: id,
        venta: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      _sum: { cantidad: true },
    }),
  ]);

  if (!producto) notFound();

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);
  const ventasSemana = await prisma.itemVenta.aggregate({
    where: { productoId: id, venta: { createdAt: { gte: inicioSemana } } },
    _sum: { cantidad: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white">{producto.nombre}</h2>
          <p className="text-white/55">
            {producto.categoria.nombre}
            {producto.codigo ? ` · ${producto.codigo}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/productos/${producto.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <ProductoAjusteStock
            productoId={producto.id}
            stockActual={producto.stockActual}
          />
        </div>
      </div>

      {producto.imagenes.length > 0 && (
        <ProductoGaleria imagenes={producto.imagenes} />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{producto.stockActual}</p>
            <p className="text-xs text-white/45">Mínimo {producto.stockMinimo}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Vendido (mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">
              {ventasMes._sum.cantidad ?? 0} u.
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Vendido (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {ventasSemana._sum.cantidad ?? 0} u.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Movimientos de stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-white/45">
                    Sin movimientos
                  </TableCell>
                </TableRow>
              ) : (
                movs.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {format(m.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>{m.tipo}</TableCell>
                    <TableCell>{m.motivo}</TableCell>
                    <TableCell className="text-right font-mono">
                      {m.tipo === "SALIDA" ? "-" : "+"}
                      {m.cantidad}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
