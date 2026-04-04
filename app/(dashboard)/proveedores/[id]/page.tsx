import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/utils";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";

export default async function ProveedorDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const p = await prisma.proveedor.findUnique({
    where: { id },
    include: {
      productos: { take: 50, orderBy: { nombre: "asc" } },
      compras: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/proveedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">{p.nombre}</h2>
          <p className="text-white/55">
            {p.telefono} · {p.email}
          </p>
        </div>
      </div>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Productos asociados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {p.productos.map((pr) => (
            <Link
              key={pr.id}
              href={`/productos/${pr.id}`}
              className="rounded-full border border-white/10 px-3 py-1 text-sm hover:border-[#E01010]/40"
            >
              {pr.nombre}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Historial de compras</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p.compras.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {format(c.createdAt, "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>{formatARS(c.total)}</TableCell>
                  <TableCell>{c.estado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
