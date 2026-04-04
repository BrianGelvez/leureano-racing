"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crearOrdenTrabajo } from "@/app/actions/taller";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { formatARS } from "@/lib/utils";
import { ProductoThumbnail } from "@/components/productos/producto-thumbnail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Cliente = { id: number; nombre: string; apellido: string };
type Prod = {
  id: number;
  nombre: string;
  codigo: string | null;
  stockActual: number;
  precioPublico: number;
  imagenPrincipal?: string | null;
};

type Line = {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnit: number;
  imagenPrincipal?: string | null;
};

export function NuevaOrdenForm({
  clientes,
  productos,
}: {
  clientes: Cliente[];
  productos: Prod[];
}) {
  const router = useRouter();
  const [clienteId, setClienteId] = React.useState<string>("none");
  const [motoMarca, setMotoMarca] = React.useState("");
  const [motoModelo, setMotoModelo] = React.useState("");
  const [motoPatente, setMotoPatente] = React.useState("");
  const [motoAnio, setMotoAnio] = React.useState("");
  const [km, setKm] = React.useState("");
  const [falla, setFalla] = React.useState("");
  const [manoObra, setManoObra] = React.useState(0);
  const [fechaEst, setFechaEst] = React.useState("");
  const [notas, setNotas] = React.useState("");
  const [lines, setLines] = React.useState<Line[]>([]);
  const [q, setQ] = React.useState("");
  const [confirm, setConfirm] = React.useState(false);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return productos
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(s) ||
          (p.codigo?.toLowerCase().includes(s) ?? false)
      )
      .slice(0, 10);
  }, [q, productos]);

  function add(p: Prod) {
    const ex = lines.find((l) => l.productoId === p.id);
    if (ex) {
      if (ex.cantidad >= p.stockActual) {
        toast.error("Sin stock");
        return;
      }
      setLines(
        lines.map((l) =>
          l.productoId === p.id ? { ...l, cantidad: l.cantidad + 1 } : l
        )
      );
    } else if (p.stockActual < 1) {
      toast.error("Sin stock");
    } else {
      setLines([
        ...lines,
        {
          productoId: p.id,
          nombre: p.nombre,
          cantidad: 1,
          precioUnit: p.precioPublico,
          imagenPrincipal: p.imagenPrincipal ?? null,
        },
      ]);
    }
    setQ("");
  }

  function setQty(pid: number, d: number) {
    setLines((prev) => {
      const p = productos.find((x) => x.id === pid);
      if (!p) return prev;
      return prev
        .map((l) => {
          if (l.productoId !== pid) return l;
          const n = Math.max(0, l.cantidad + d);
          if (n > p.stockActual) {
            toast.error("Stock insuficiente");
            return l;
          }
          return { ...l, cantidad: n };
        })
        .filter((l) => l.cantidad > 0);
    });
  }

  async function submit() {
    const res = await crearOrdenTrabajo({
      clienteId: clienteId === "none" ? null : Number(clienteId),
      motoMarca: motoMarca || undefined,
      motoModelo: motoModelo || undefined,
      motoPatente: motoPatente || undefined,
      motoAnio: motoAnio ? Number(motoAnio) : null,
      kilometraje: km ? Number(km) : null,
      descripcionFalla: falla,
      costoManoObra: manoObra,
      fechaEstimada: fechaEst || undefined,
      notas: notas || undefined,
      items: lines.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
        precioUnit: l.precioUnit,
      })),
    });
    setConfirm(false);
    if (!res.ok) {
      toast.error("message" in res ? res.message : "Error");
      return;
    }
    toast.success("Orden creada");
    router.push(`/taller/ordenes/${res.id}`);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Cliente y moto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cliente</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre} {c.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input value={motoMarca} onChange={(e) => setMotoMarca(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input value={motoModelo} onChange={(e) => setMotoModelo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Patente</Label>
            <Input value={motoPatente} onChange={(e) => setMotoPatente(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Año</Label>
            <Input value={motoAnio} onChange={(e) => setMotoAnio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Kilometraje</Label>
            <Input value={km} onChange={(e) => setKm(e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Descripción de la falla</Label>
            <Textarea
              rows={4}
              value={falla}
              onChange={(e) => setFalla(e.target.value)}
              placeholder="Qué le pasa a la moto…"
            />
          </div>
          <div className="space-y-2">
            <Label>Mano de obra ($)</Label>
            <Input
              type="number"
              value={manoObra}
              onChange={(e) => setManoObra(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha estimada entrega</Label>
            <Input
              type="date"
              value={fechaEst}
              onChange={(e) => setFechaEst(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Notas internas</Label>
            <Textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Repuestos del taller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              className="pl-9"
              placeholder="Buscar repuesto…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {filtered.length > 0 && (
            <div className="max-h-36 space-y-1 overflow-auto rounded-lg border border-white/10 p-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-white/10"
                  onClick={() => add(p)}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <ProductoThumbnail
                      src={p.imagenPrincipal}
                      size={32}
                      rounded="md"
                    />
                    <span className="min-w-0 truncate">{p.nombre}</span>
                  </span>
                  <span className="shrink-0 text-xs text-white/45">
                    st {p.stockActual}
                  </span>
                </button>
              ))}
            </div>
          )}
          <ScrollArea className="h-[220px] rounded-lg border border-white/10 p-2">
            {lines.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/45">Sin repuestos</p>
            ) : (
              <ul className="space-y-2">
                {lines.map((l) => (
                  <li
                    key={l.productoId}
                    className="flex items-center justify-between gap-2 rounded border border-white/[0.06] p-2"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <ProductoThumbnail
                        src={l.imagenPrincipal}
                        size={40}
                        rounded="md"
                      />
                      <span className="truncate text-sm">{l.nombre}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => setQty(l.productoId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center text-sm">{l.cantidad}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => setQty(l.productoId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Input
                        className="h-7 w-20 text-right"
                        type="number"
                        value={l.precioUnit}
                        onChange={(e) =>
                          setLines(
                            lines.map((x) =>
                              x.productoId === l.productoId
                                ? { ...x, precioUnit: Number(e.target.value) || 0 }
                                : x
                            )
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-400"
                        onClick={() =>
                          setLines(lines.filter((x) => x.productoId !== l.productoId))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          <p className="text-sm text-white/60">
            Total repuestos:{" "}
            {formatARS(lines.reduce((s, l) => s + l.precioUnit * l.cantidad, 0))} + mano de obra{" "}
            {formatARS(manoObra)}
          </p>
          <Button
            className="w-full"
            disabled={falla.length < 5}
            onClick={() => setConfirm(true)}
          >
            Crear orden
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Crear orden de trabajo?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Se descontará stock de los repuestos listados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={submit}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
