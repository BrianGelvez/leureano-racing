import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { apellido: "asc" },
    include: {
      ventas: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Clientes</h2>
          <p className="text-white/55">Cuentas y contacto</p>
        </div>
        <Button asChild>
          <Link href="/clientes/nuevo">Nuevo cliente</Link>
        </Button>
      </div>

      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16">
          <Users className="mb-3 h-12 w-12 text-white/25" />
          <p className="text-white/55">No hay clientes cargados.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Última compra</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.nombre} {c.apellido}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.tipoCliente === "MAYORISTA" ? "default" : "secondary"
                      }
                    >
                      {c.tipoCliente === "MAYORISTA" ? "Mayorista" : "Minorista"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60">{c.telefono ?? "—"}</TableCell>
                  <TableCell
                    className={
                      c.saldoPendiente > 0 ? "text-amber-400" : "text-white/50"
                    }
                  >
                    {formatARS(c.saldoPendiente)}
                  </TableCell>
                  <TableCell className="text-white/50 text-sm">
                    {c.ventas[0]
                      ? new Date(c.ventas[0].createdAt).toLocaleDateString("es-AR")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clientes/${c.id}`}>Ver</Link>
                    </Button>
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
