import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { imagenPrincipalUrl } from "@/lib/product-images";
import { formatARS } from "@/lib/utils";
import { ProductoThumbnail } from "@/components/productos/producto-thumbnail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VentasChart } from "@/components/dashboard/ventas-chart";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
  eachDayOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { Package, ShoppingCart, Wrench, Users, Bell, AlertTriangle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardHero,
  DashboardPage as DashboardPageShell,
} from "@/components/layout/dashboard-page-shell";

type ProductoStockDashboard = Prisma.ProductoGetPayload<{
  include: { categoria: true };
}> & {
  imagenes: { url: string; orden: number }[];
};

export default async function DashboardHomePage() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const from7 = subDays(dayStart, 6);

  const [
    ventasDia,
    ventasMes,
    ordenesActivas,
    encargosPendientesAviso,
    saldoClientes,
    ultimasVentas,
    ordenesEnProceso,
    ventas7d,
  ] = await Promise.all([
    prisma.venta.aggregate({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
      _sum: { total: true },
    }),
    prisma.venta.aggregate({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
      _sum: { total: true },
    }),
    prisma.ordenTrabajo.count({
      where: {
        estado: { notIn: ["ENTREGADA"] },
      },
    }),
    prisma.encargo.count({ where: { estado: "LLEGADO_AVISAR" } }),
    prisma.cliente.aggregate({ _sum: { saldoPendiente: true } }),
    prisma.venta.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { cliente: true },
    }),
    prisma.ordenTrabajo.findMany({
      where: {
        estado: { in: ["RECIBIDA", "EN_PROCESO", "ESPERANDO_REPUESTO", "LISTA"] },
      },
      take: 6,
      orderBy: { fechaIngreso: "desc" },
      include: { cliente: true },
    }),
    prisma.venta.findMany({
      where: { createdAt: { gte: from7, lte: dayEnd } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const productosStockBajo = (await prisma.producto.findMany({
    where: { activo: true },
    include: {
      categoria: true,
      imagenes: { orderBy: { orden: "asc" } },
    } as NonNullable<Parameters<typeof prisma.producto.findMany>[0]>["include"],
  })) as ProductoStockDashboard[];

  const bajos = productosStockBajo.filter(
    (p) => p.stockActual <= p.stockMinimo
  );

  const days = eachDayOfInterval({ start: from7, end: dayStart });
  const chartData = days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const total = ventas7d
      .filter((v) => format(v.createdAt, "yyyy-MM-dd") === key)
      .reduce((s, v) => s + v.total, 0);
    return {
      dia: format(d, "EEE d", { locale: es }),
      total,
    };
  });

  const kpis = [
    {
      title: "Ventas hoy",
      value: formatARS(ventasDia._sum.total ?? 0),
      icon: ShoppingCart,
    },
    {
      title: "Ventas del mes",
      value: formatARS(ventasMes._sum.total ?? 0),
      icon: ShoppingCart,
    },
    {
      title: "Órdenes taller activas",
      value: String(ordenesActivas),
      icon: Wrench,
      href: "/taller/ordenes",
    },
    {
      title: "Stock bajo",
      value: String(bajos.length),
      icon: Package,
      href: "/productos?stock=bajo",
    },
    {
      title: "Encargos para avisar",
      value: String(encargosPendientesAviso),
      icon: Bell,
      href: "/encargos?estado=LLEGADO_AVISAR",
    },
    {
      title: "Deudas clientes",
      value: formatARS(saldoClientes._sum.saldoPendiente ?? 0),
      icon: Users,
      href: "/caja",
    },
  ];

  return (
    <DashboardPageShell>
      <DashboardHero
        title="Panel principal"
        description="Resumen del negocio en tiempo real: ventas, taller, stock y cuentas."
        icon={<LayoutDashboard className="h-7 w-7 text-[#E01010]" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          const inner = (
            <Card className="border-white/[0.06] transition-all duration-200 hover:border-[#E01010]/25">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  {k.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-[#E01010]" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{k.value}</p>
              </CardContent>
            </Card>
          );
          return k.href ? (
            <Link key={k.title} href={k.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={k.title}>{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/[0.06] lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            <VentasChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="border-white/[0.06]">
          <CardHeader>
            <CardTitle>Últimas ventas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ultimasVentas.length === 0 ? (
              <p className="text-sm text-white/50">Sin ventas recientes</p>
            ) : (
              ultimasVentas.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      #{v.numero}{" "}
                      <span className="font-normal text-white/50">
                        {v.cliente
                          ? `${v.cliente.nombre} ${v.cliente.apellido}`
                          : "Mostrador"}
                      </span>
                    </p>
                    <p className="text-xs text-white/45">
                      {format(v.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatARS(v.total)}
                  </span>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/ventas/historial">Ver historial</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/[0.06]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Órdenes en curso</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/taller/ordenes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {ordenesEnProceso.map((o) => (
              <Link
                key={o.id}
                href={`/taller/ordenes/${o.id}`}
                className="block rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-[#E01010]/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-[#E01010]">
                    OT-{o.numero}
                  </span>
                  <Badge variant="secondary">{o.estado.replace(/_/g, " ")}</Badge>
                </div>
                <p className="mt-1 text-sm text-white/80">
                  {o.cliente
                    ? `${o.cliente.nombre} ${o.cliente.apellido}`
                    : "Sin cliente"}{" "}
                  · {o.motoMarca} {o.motoModelo}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/[0.06]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Stock mínimo
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/productos?stock=bajo">Filtrar</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {bajos.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <ProductoThumbnail
                    src={imagenPrincipalUrl(p.imagenes)}
                    size={36}
                    rounded="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {p.nombre}
                    </p>
                    <p className="text-xs text-white/45">{p.categoria.nombre}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={
                      p.stockActual === 0
                        ? "text-sm font-bold text-red-400"
                        : "text-sm font-semibold text-amber-400"
                    }
                  >
                    {p.stockActual} / mín {p.stockMinimo}
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs text-[#E01010]" asChild>
                    <Link href={`/encargos/nuevo?productoId=${p.id}`}>Encargar</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
