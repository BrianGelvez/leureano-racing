"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { formatARS } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Venta = { total: number; createdAt: Date };
type Top = { nombre: string; cantidad: number };

export function ReportesCharts({
  ventas,
  topProductos,
}: {
  ventas: Venta[];
  topProductos: Top[];
}) {
  const byDay: Record<string, number> = {};
  for (const v of ventas) {
    const k = format(new Date(v.createdAt), "yyyy-MM-dd");
    byDay[k] = (byDay[k] ?? 0) + v.total;
  }
  const lineData = Object.entries(byDay).map(([k, total]) => ({
    dia: format(new Date(k), "d MMM", { locale: es }),
    total,
  }));

  const barData = topProductos.map((t) => ({
    nombre: t.nombre.length > 20 ? t.nombre.slice(0, 18) + "…" : t.nombre,
    cantidad: t.cantidad,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Ventas por día</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dia" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                formatter={(v) =>
                  formatARS(typeof v === "number" ? v : Number(v))
                }
              />
              <Line type="monotone" dataKey="total" stroke="#E01010" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Más vendidos</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="nombre"
                width={100}
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <Bar dataKey="cantidad" fill="#E01010" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
