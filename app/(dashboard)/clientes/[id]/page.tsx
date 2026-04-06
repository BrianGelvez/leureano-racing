import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { ClientePagoModal } from "@/components/clientes/cliente-pago-modal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

export default async function ClienteDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      movimientosCuenta: { orderBy: { createdAt: "desc" }, take: 30 },
      ventas: { orderBy: { createdAt: "desc" }, take: 20 },
      ordenesTrabajo: { orderBy: { fechaIngreso: "desc" }, take: 10 },
      encargos: {
        where: { estado: { not: "ENTREGADO" } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!cliente) notFound();

  return (
    <DashboardPage narrow>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { href: "/clientes", label: "Clientes" },
          { label: `${cliente.nombre} ${cliente.apellido}` },
        ]}
      />
      <DashboardHero
        backHref="/clientes"
        backLabel="Volver a clientes"
        title={`${cliente.nombre} ${cliente.apellido}`}
        description={
          <>
            Saldo cuenta corriente:{" "}
            <span
              className={
                cliente.saldoPendiente > 0 ? "text-amber-400" : "text-white/80"
              }
            >
              {formatARS(cliente.saldoPendiente)}
            </span>
          </>
        }
        icon={<Users className="h-7 w-7 text-[#E01010]" />}
        actions={<ClientePagoModal clienteId={cliente.id} />}
      />

      <ClienteForm
        clienteId={cliente.id}
        afterSaveRedirect={null}
        defaultValues={{
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          dni: cliente.dni ?? undefined,
          telefono: cliente.telefono ?? undefined,
          email: cliente.email ?? undefined,
          direccion: cliente.direccion ?? undefined,
          tipoCliente: cliente.tipoCliente as "MINORISTA" | "MAYORISTA",
          notas: cliente.notas ?? undefined,
        }}
      />

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Movimientos de cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cliente.movimientosCuenta.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {format(m.createdAt, "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>{m.tipo}</TableCell>
                  <TableCell>{m.descripcion}</TableCell>
                  <TableCell className="text-right">{formatARS(m.monto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Compras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cliente.ventas.map((v) => (
            <div
              key={v.id}
              className="flex justify-between rounded border border-white/10 px-3 py-2 text-sm"
            >
              <span>#{v.numero}</span>
              <span className="text-emerald-400">{formatARS(v.total)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Taller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cliente.ordenesTrabajo.map((o) => (
            <Link
              key={o.id}
              href={`/taller/ordenes/${o.id}`}
              className="block rounded border border-white/10 px-3 py-2 text-sm hover:border-[#E01010]/40"
            >
              OT-{o.numero} · {o.estado}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Encargos activos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-white/70">
          {cliente.encargos.length === 0
            ? "Ninguno"
            : cliente.encargos.map((e) => (
                <p key={e.id}>
                  Encargo #{e.id} — {e.estado}
                </p>
              ))}
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
