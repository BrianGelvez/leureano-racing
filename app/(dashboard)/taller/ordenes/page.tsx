import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatARS } from "@/lib/utils";
import { Wrench } from "lucide-react";
import {
  DashboardBreadcrumb,
  DashboardEmptyState,
  DashboardHero,
  DashboardPage,
} from "@/components/layout/dashboard-page-shell";

const estadoColor: Record<string, string> = {
  RECIBIDA: "border-blue-500/40 bg-blue-500/10",
  EN_PROCESO: "border-amber-500/40 bg-amber-500/10",
  ESPERANDO_REPUESTO: "border-orange-500/40 bg-orange-500/10",
  LISTA: "border-emerald-500/40 bg-emerald-500/10",
  ENTREGADA: "border-white/20 bg-white/5",
};

const columnas = [
  "RECIBIDA",
  "EN_PROCESO",
  "ESPERANDO_REPUESTO",
  "LISTA",
  "ENTREGADA",
] as const;

export default async function TallerOrdenesPage() {
  const ordenes = await prisma.ordenTrabajo.findMany({
    orderBy: { fechaIngreso: "desc" },
    include: { cliente: true },
  });

  return (
    <DashboardPage>
      <DashboardBreadcrumb
        items={[
          { href: "/", label: "Inicio" },
          { label: "Órdenes de taller" },
        ]}
      />
      <DashboardHero
        title="Órdenes de taller"
        description="Tablero por estado: arrastrá mentalmente el flujo desde ingreso hasta entrega."
        icon={<Wrench className="h-7 w-7 text-[#E01010]" />}
        actions={
          <Button asChild>
            <Link href="/taller/nueva-orden">Nueva orden</Link>
          </Button>
        }
      />

      {ordenes.length === 0 ? (
        <DashboardEmptyState
          icon={<Wrench className="h-12 w-12" />}
          title="No hay órdenes cargadas"
          description="Creá la primera orden de trabajo para seguir el circuito del taller."
          action={
            <Button asChild>
              <Link href="/taller/nueva-orden">Nueva orden</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {columnas.map((estado) => {
            const list = ordenes.filter((o) => o.estado === estado);
            return (
              <div key={estado} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  {estado.replace(/_/g, " ")} ({list.length})
                </h3>
                <div className="space-y-2">
                  {list.length === 0 ? (
                    <p className="text-xs text-white/35">Vacío</p>
                  ) : (
                    list.map((o) => (
                      <Link key={o.id} href={`/taller/ordenes/${o.id}`}>
                        <Card
                          className={`border transition-colors hover:border-[#E01010]/40 ${estadoColor[estado] ?? ""}`}
                        >
                          <CardContent className="p-3">
                            <p className="font-mono text-sm text-[#E01010]">
                              OT-{o.numero}
                            </p>
                            <p className="text-sm text-white">
                              {o.cliente
                                ? `${o.cliente.nombre} ${o.cliente.apellido}`
                                : "Sin cliente"}
                            </p>
                            <p className="text-xs text-white/50">
                              {o.motoMarca} {o.motoModelo}{" "}
                              {o.motoPatente ? `· ${o.motoPatente}` : ""}
                            </p>
                            <p className="mt-2 line-clamp-2 text-xs text-white/45">
                              {o.descripcionFalla}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-white/40">
                                {format(o.fechaIngreso, "dd/MM", { locale: es })}
                              </span>
                              <Badge variant="secondary">{formatARS(o.total)}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardPage>
  );
}
