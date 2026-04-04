import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfDay, endOfDay } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function CajaPage() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const ventasHoy = await prisma.venta.findMany({
    where: { createdAt: { gte: dayStart, lte: dayEnd } },
  });

  const porMedio: Record<string, number> = {};
  let totalDia = 0;
  for (const v of ventasHoy) {
    totalDia += v.total;
    porMedio[v.medioPago] = (porMedio[v.medioPago] ?? 0) + v.total;
  }

  const deudores = await prisma.cliente.findMany({
    where: { saldoPendiente: { gt: 0 } },
    orderBy: { saldoPendiente: "desc" },
  });

  const totalDeuda = deudores.reduce((s, c) => s + c.saldoPendiente, 0);

  const movs = await prisma.movimientoCuenta.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { cliente: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Caja y finanzas</h2>
        <p className="text-white/55">Resumen del día y cuentas corrientes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Ventas hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">{formatARS(totalDia)}</p>
            <p className="text-xs text-white/45">{ventasHoy.length} operaciones</p>
          </CardContent>
        </Card>
        {Object.entries(porMedio).map(([k, v]) => (
          <Card key={k} className="border-white/10">
            <CardHeader>
              <CardTitle className="text-sm text-white/60">
                {k.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-white">{formatARS(v)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clientes con saldo</CardTitle>
          <p className="text-sm text-amber-400">Total: {formatARS(totalDeuda)}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {deudores.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2"
            >
              <span>
                {c.nombre} {c.apellido}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">{formatARS(c.saldoPendiente)}</span>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/clientes/${c.id}`}>Ver</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Movimientos recientes (cuenta corriente)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-white/60 text-sm">
                    {m.createdAt.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell>
                    {m.cliente.nombre} {m.cliente.apellido}
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
    </div>
  );
}
