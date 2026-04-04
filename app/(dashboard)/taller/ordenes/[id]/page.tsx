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
import { formatARS } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OrdenEstadoActions } from "@/components/taller/orden-estado-actions";
import { OrdenPdfButton } from "@/components/taller/orden-pdf-button";
import { Badge } from "@/components/ui/badge";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { ProductoThumbnail } from "@/components/productos/producto-thumbnail";

export default async function OrdenDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id },
    include: {
      cliente: true,
      items: {
        include: {
          producto: { include: { imagenes: { orderBy: { orden: "asc" } } } },
        },
      },
      historialEstados: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!orden) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/taller/ordenes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">
            OT-{orden.numero}
            <Badge className="ml-3" variant="secondary">
              {orden.estado.replace(/_/g, " ")}
            </Badge>
          </h2>
          <p className="text-white/55">
            Ingreso{" "}
            {format(orden.fechaIngreso, "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        </div>
        <OrdenPdfButton ordenId={orden.id} numero={orden.numero} />
      </div>

      <OrdenEstadoActions ordenId={orden.id} estadoActual={orden.estado} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Cliente y moto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p>
              <span className="text-white/45">Cliente: </span>
              {orden.cliente
                ? `${orden.cliente.nombre} ${orden.cliente.apellido}`
                : "—"}
            </p>
            <p>
              {orden.motoMarca} {orden.motoModelo} {orden.motoPatente}
            </p>
            <p className="text-white/55">
              Año {orden.motoAnio ?? "—"} · Km {orden.kilometraje ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Totales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Mano de obra: {formatARS(orden.costoManoObra)}</p>
            <p>Repuestos: {formatARS(orden.costoRepuestos)}</p>
            <p className="text-lg font-bold text-white">
              Total {formatARS(orden.total)}
            </p>
            <p className="text-white/50">
              Pago: {orden.estadoPago} {orden.medioPago ?? ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Falla</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/85">{orden.descripcionFalla}</p>
          {orden.trabajoRealizado && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-white/60">Trabajo realizado</p>
              <p className="text-white/85">{orden.trabajoRealizado}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Repuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14" />
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">P. unit.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orden.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="align-middle">
                    <ProductoThumbnail
                      src={imagenPrincipalUrl(it.producto.imagenes)}
                      size={40}
                      rounded="md"
                    />
                  </TableCell>
                  <TableCell>{it.producto.nombre}</TableCell>
                  <TableCell className="text-right">{it.cantidad}</TableCell>
                  <TableCell className="text-right">
                    {formatARS(it.precioUnit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Historial de estados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          {orden.historialEstados.map((h) => (
            <div key={h.id} className="flex justify-between border-b border-white/5 py-1">
              <span>{h.estado.replace(/_/g, " ")}</span>
              <span className="text-white/45">
                {format(h.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
