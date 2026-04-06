import { prisma } from "@/lib/prisma";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { formatARS } from "@/lib/utils";
import { ProductoThumbnail } from "@/components/productos/producto-thumbnail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportesCharts } from "@/components/reportes/reportes-charts";

export default async function ReportesPage() {
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 1);

  const [ventas, itemsAgg, productos, ordenes] = await Promise.all([
    prisma.venta.findMany({
      where: { createdAt: { gte: desde } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.itemVenta.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      where: { venta: { createdAt: { gte: desde } } },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 10,
    }),
    prisma.producto.findMany({
      include: {
        categoria: true,
        imagenes: { orderBy: { orden: "asc" } },
      },
    }),
    prisma.ordenTrabajo.findMany({
      where: { createdAt: { gte: desde } },
    }),
  ]);

  const prodMap = Object.fromEntries(productos.map((p) => [p.id, p]));
  const top = itemsAgg.map((a) => {
    const prod = prodMap[a.productoId];
    return {
      productoId: a.productoId,
      nombre: prod?.nombre ?? `#${a.productoId}`,
      cantidad: a._sum.cantidad ?? 0,
      imagenPrincipal: imagenPrincipalUrl(prod?.imagenes),
    };
  });

  const ingresosTaller = ordenes.reduce(
    (s, o) => s + o.costoManoObra + o.costoRepuestos,
    0
  );

  const rentabilidad = productos.slice(0, 15).map((p) => ({
    nombre: p.nombre,
    margen:
      p.precioCompra > 0
        ? Math.round(
            ((p.precioPublico - p.precioCompra) / p.precioCompra) * 1000
          ) / 10
        : 0,
  }));

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Reportes" },
        ]}
      />
      <DashboardHero
        title="Reportes"
        description="Últimos 30 días: ventas, top productos, taller y márgenes orientativos (MVP)."
        icon={<FileText className="h-7 w-7 text-[#E01010]" />}
      />

      <ReportesCharts
        ventas={ventas}
        topProductos={top.map((t) => ({
          nombre: t.nombre,
          cantidad: t.cantidad,
        }))}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Top productos vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((t) => (
                  <TableRow key={t.productoId}>
                    <TableCell>
                      <ProductoThumbnail
                        src={t.imagenPrincipal}
                        size={32}
                        rounded="md"
                      />
                    </TableCell>
                    <TableCell>{t.nombre}</TableCell>
                    <TableCell className="text-right">{t.cantidad}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Ingresos taller (período)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{formatARS(ingresosTaller)}</p>
            <p className="text-sm text-white/50">
              Suma de mano de obra + repuestos en órdenes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Margen sobre costo (muestra)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">% margen público</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentabilidad.map((r) => (
                <TableRow key={r.nombre}>
                  <TableCell>{r.nombre}</TableCell>
                  <TableCell className="text-right text-emerald-400">
                    {r.margen}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Stock bajo / agotado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {productos
            .filter((p) => p.stockActual <= p.stockMinimo)
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <ProductoThumbnail
                    src={imagenPrincipalUrl(p.imagenes)}
                    size={32}
                    rounded="md"
                  />
                  <span className="truncate">{p.nombre}</span>
                </span>
                <span className="shrink-0">
                  {p.stockActual} / mín {p.stockMinimo}
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
