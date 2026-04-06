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
import {
  DashboardBreadcrumb,
  DashboardEmptyState,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { apellido: "asc" },
    include: {
      ventas: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Clientes" },
        ]}
      />
      <DashboardHero
        title="Clientes"
        description="Cuentas corrientes, tipo minorista o mayorista, y contacto rápido para ventas y taller."
        icon={<Users className="h-7 w-7 text-[#E01010]" />}
        actions={
          <Button asChild>
            <Link href="/clientes/nuevo">Nuevo cliente</Link>
          </Button>
        }
      />

      {clientes.length === 0 ? (
        <DashboardEmptyState
          icon={<Users className="h-12 w-12" />}
          title="Todavía no hay clientes"
          description="Creá el primero para asociarlo a ventas, taller y encargos."
          action={
            <Button asChild>
              <Link href="/clientes/nuevo">Nuevo cliente</Link>
            </Button>
          }
        />
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
                  <TableCell className="text-sm text-white/50">
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
    </DashboardPage>
  );
}
