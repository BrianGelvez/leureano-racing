"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatARS } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComprobanteVentaPdfButton } from "@/components/ventas/comprobante-venta-pdf-button";
import { EmitirFacturaModal } from "@/components/ventas/emitir-factura-modal";
import { ShoppingBag } from "lucide-react";

export type VentaRow = {
  id: number;
  numero: number;
  total: number;
  medioPago: string;
  estadoPago: string;
  createdAt: Date;
  cliente: { nombre: string; apellido: string } | null;
  facturaARCA: string | null;
};

export function VentasHistorialTable({ ventas }: { ventas: VentaRow[] }) {
  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-20 text-center">
        <ShoppingBag className="mb-3 h-12 w-12 text-white/25" />
        <p className="text-white/55">Todavía no hay ventas registradas.</p>
        <Button asChild className="mt-4">
          <Link href="/ventas/nueva">Registrar primera venta</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>ARCA</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-mono text-[#E01010]">#{v.numero}</TableCell>
              <TableCell>
                {format(v.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
              </TableCell>
              <TableCell>
                {v.cliente
                  ? `${v.cliente.nombre} ${v.cliente.apellido}`
                  : "Mostrador"}
              </TableCell>
              <TableCell className="font-medium text-emerald-400">
                {formatARS(v.total)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{v.medioPago.replace(/_/g, " ")}</Badge>
                <span className="ml-1 text-xs text-white/45">{v.estadoPago}</span>
              </TableCell>
              <TableCell className="text-xs text-white/55">
                {v.facturaARCA ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EmitirFacturaModal ventaId={v.id} />
                  <ComprobanteVentaPdfButton ventaId={v.id} numero={v.numero} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
