"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EncargoEstadoActions } from "@/components/encargos/encargo-estado-actions";
import { ClipboardList } from "lucide-react";

type Row = {
  id: number;
  estado: string;
  createdAt: Date;
  cliente: { nombre: string; apellido: string };
  items: {
    cantidad: number;
    descripcion: string;
    producto: { nombre: string } | null;
  }[];
};

export function EncargosTable({ encargos }: { encargos: Row[] }) {
  if (encargos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16">
        <ClipboardList className="mb-3 h-12 w-12 text-white/25" />
        <p className="text-white/55">No hay encargos.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Ítems</TableHead>
            <TableHead className="min-w-[12rem]">Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {encargos.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                {e.cliente.nombre} {e.cliente.apellido}
              </TableCell>
              <TableCell className="max-w-[200px] text-sm text-white/70">
                {e.items.map((it, i) => (
                  <div key={i}>
                    {it.producto?.nombre ?? it.descripcion} x{it.cantidad}
                  </div>
                ))}
              </TableCell>
              <TableCell className="align-middle">
                <EncargoEstadoActions encargoId={e.id} estadoActual={e.estado} />
              </TableCell>
              <TableCell className="text-sm text-white/50">
                {format(e.createdAt, "dd/MM/yyyy", { locale: es })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
