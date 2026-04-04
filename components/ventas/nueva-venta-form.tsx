"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatARS } from "@/lib/utils";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { crearVenta } from "@/app/actions/ventas";
import { toast } from "sonner";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { ComprobanteVentaPdfButton } from "@/components/ventas/comprobante-venta-pdf-button";
import { ProductoThumbnail } from "@/components/productos/producto-thumbnail";

type ClienteOpt = {
  id: number;
  nombre: string;
  apellido: string;
  tipoCliente: string;
  saldoPendiente: number;
};

type ProdOpt = {
  id: number;
  nombre: string;
  codigo: string | null;
  stockActual: number;
  precioPublico: number;
  precioRevendedor: number;
  categoria: { nombre: string };
  imagenPrincipal?: string | null;
};

type Line = {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnit: number;
  imagenPrincipal?: string | null;
};

/** Lista de precios que aplica a ítems y búsqueda (cliente mayorista/minorista tiene prioridad). */
function tipoListaEfectivo(
  cliente: ClienteOpt | undefined,
  tipoPrecio: "PUBLICO" | "REVENDEDOR"
): "PUBLICO" | "REVENDEDOR" {
  if (cliente?.tipoCliente === "MAYORISTA") return "REVENDEDOR";
  if (cliente?.tipoCliente === "MINORISTA") return "PUBLICO";
  return tipoPrecio;
}

export function NuevaVentaForm({
  clientes,
  productos,
}: {
  clientes: ClienteOpt[];
  productos: ProdOpt[];
}) {
  const router = useRouter();
  const [clienteId, setClienteId] = React.useState<string>("none");
  const [tipoPrecio, setTipoPrecio] = React.useState<"PUBLICO" | "REVENDEDOR">(
    "PUBLICO"
  );
  const [lines, setLines] = React.useState<Line[]>([]);
  const [q, setQ] = React.useState("");
  const [descTipo, setDescTipo] = React.useState<
    "NINGUNO" | "PORCENTAJE" | "MONTO"
  >("NINGUNO");
  const [descValor, setDescValor] = React.useState(0);
  const [medioPago, setMedioPago] = React.useState<
    "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "CUENTA_CORRIENTE"
  >("EFECTIVO");
  const [montoPagado, setMontoPagado] = React.useState(0);
  const [notas, setNotas] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [lastVenta, setLastVenta] = React.useState<{
    id: number;
    numero: number;
  } | null>(null);

  const cliente = clientes.find((c) => String(c.id) === clienteId);
  const tipoLista = tipoListaEfectivo(cliente, tipoPrecio);

  React.useEffect(() => {
    if (cliente?.tipoCliente === "MAYORISTA") {
      setTipoPrecio("REVENDEDOR");
    } else if (cliente && cliente.tipoCliente === "MINORISTA") {
      setTipoPrecio("PUBLICO");
    }
  }, [clienteId, cliente]);

  React.useEffect(() => {
    setLines((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((l) => {
        const p = productos.find((x) => x.id === l.productoId);
        if (!p) return l;
        const precio =
          tipoLista === "REVENDEDOR" ? p.precioRevendedor : p.precioPublico;
        return { ...l, precioUnit: precio };
      });
    });
  }, [tipoLista, productos]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return productos
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(s) ||
          (p.codigo?.toLowerCase().includes(s) ?? false) ||
          p.categoria.nombre.toLowerCase().includes(s)
      )
      .slice(0, 12);
  }, [q, productos]);

  function addProduct(p: ProdOpt) {
    const precio =
      tipoLista === "REVENDEDOR" ? p.precioRevendedor : p.precioPublico;
    const ex = lines.find((l) => l.productoId === p.id);
    if (ex) {
      if (ex.cantidad >= p.stockActual) {
        toast.error("No hay más stock disponible");
        return;
      }
      setLines(
        lines.map((l) =>
          l.productoId === p.id ? { ...l, cantidad: l.cantidad + 1 } : l
        )
      );
    } else {
      if (p.stockActual < 1) {
        toast.error("Sin stock");
        return;
      }
      setLines([
        ...lines,
        {
          productoId: p.id,
          nombre: p.nombre,
          cantidad: 1,
          precioUnit: precio,
          imagenPrincipal: p.imagenPrincipal ?? null,
        },
      ]);
    }
    setQ("");
  }

  function setQty(pid: number, delta: number) {
    setLines((prev) => {
      const p = productos.find((x) => x.id === pid);
      if (!p) return prev;
      return prev
        .map((l) => {
          if (l.productoId !== pid) return l;
          const n = Math.max(0, l.cantidad + delta);
          if (n > p.stockActual) {
            toast.error("Stock insuficiente");
            return l;
          }
          return { ...l, cantidad: n };
        })
        .filter((l) => l.cantidad > 0);
    });
  }

  function setPrecio(pid: number, precio: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.productoId === pid ? { ...l, precioUnit: precio } : l
      )
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.precioUnit * l.cantidad, 0);
  let descuento = 0;
  if (descTipo === "PORCENTAJE") descuento = subtotal * (descValor / 100);
  if (descTipo === "MONTO") descuento = descValor;
  const total = Math.max(0, subtotal - descuento);

  React.useEffect(() => {
    if (medioPago !== "CUENTA_CORRIENTE") setMontoPagado(total);
    else setMontoPagado(0);
  }, [total, medioPago]);

  async function confirmar() {
    const cid =
      clienteId === "none" ? null : Number(clienteId);
    const res = await crearVenta({
      clienteId: cid,
      tipoPrecio: tipoLista,
      descuentoTipo: descTipo,
      descuentoValor: descValor,
      medioPago,
      montoPagado: medioPago === "CUENTA_CORRIENTE" ? montoPagado : total,
      notas: notas || undefined,
      items: lines.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
        precioUnit: l.precioUnit,
      })),
    });
    setConfirmOpen(false);
    if (!res.ok) {
      toast.error("message" in res ? res.message : "No se pudo registrar");
      return;
    }
    toast.success(`Venta #${res.numero} registrada`);
    setLastVenta({ id: res.ventaId, numero: res.numero });
    setLines([]);
    setNotas("");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Cliente ocasional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Cliente ocasional</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre} {c.apellido}{" "}
                    <span className="text-white/45">
                      ({c.tipoCliente === "MAYORISTA" ? "Mayorista" : "Minorista"})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cliente && cliente.saldoPendiente > 0 && (
              <p className="text-sm text-amber-400">
                Saldo pendiente: {formatARS(cliente.saldoPendiente)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Precio</span>
              <Button
                type="button"
                size="sm"
                variant={tipoLista === "PUBLICO" ? "default" : "outline"}
                onClick={() => setTipoPrecio("PUBLICO")}
              >
                Público
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipoLista === "REVENDEDOR" ? "default" : "outline"}
                onClick={() => setTipoPrecio("REVENDEDOR")}
              >
                Revendedor
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                className="pl-9"
                placeholder="Buscar por nombre, código o categoría…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {filtered.length > 0 && (
              <div className="glass-panel max-h-48 overflow-auto rounded-lg border border-white/10 p-2">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-white/10"
                    onClick={() => addProduct(p)}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <ProductoThumbnail
                        src={p.imagenPrincipal}
                        size={32}
                        rounded="md"
                      />
                      <span className="min-w-0">
                        {p.nombre}
                        <span className="ml-2 block text-xs text-white/45 sm:inline">
                          Stock {p.stockActual}
                        </span>
                      </span>
                    </span>
                    <span className="text-emerald-400">
                      {formatARS(
                        tipoLista === "REVENDEDOR"
                          ? p.precioRevendedor
                          : p.precioPublico
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <ScrollArea className="h-[280px] rounded-lg border border-white/10 p-2">
              {lines.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/45">
                  Agregá productos desde el buscador
                </p>
              ) : (
                <ul className="space-y-2">
                  {lines.map((l) => (
                    <li
                      key={l.productoId}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3"
                    >
                      <ProductoThumbnail
                        src={l.imagenPrincipal}
                        size={40}
                        rounded="md"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{l.nombre}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => setQty(l.productoId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">{l.cantidad}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => setQty(l.productoId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Input
                          type="number"
                          className="h-8 w-28 text-right"
                          value={l.precioUnit}
                          onChange={(e) =>
                            setPrecio(l.productoId, Number(e.target.value) || 0)
                          }
                        />
                        <span className="text-sm text-emerald-400">
                          {formatARS(l.precioUnit * l.cantidad)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-400"
                          onClick={() =>
                            setLines((prev) =>
                              prev.filter((x) => x.productoId !== l.productoId)
                            )
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
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Subtotal</span>
              <span>{formatARS(subtotal)}</span>
            </div>
            <div className="space-y-2">
              <Label>Descuento</Label>
              <Select
                value={descTipo}
                onValueChange={(v) => setDescTipo(v as typeof descTipo)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NINGUNO">Sin descuento</SelectItem>
                  <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                  <SelectItem value="MONTO">Monto fijo</SelectItem>
                </SelectContent>
              </Select>
              {descTipo !== "NINGUNO" && (
                <Input
                  type="number"
                  value={descValor}
                  onChange={(e) => setDescValor(Number(e.target.value) || 0)}
                />
              )}
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs uppercase text-white/45">Total</p>
              <p className="text-3xl font-bold text-white">{formatARS(total)}</p>
            </div>
            <div className="space-y-2">
              <Label>Medio de pago</Label>
              <Select
                value={medioPago}
                onValueChange={(v) => setMedioPago(v as typeof medioPago)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  <SelectItem value="CUENTA_CORRIENTE">Cuenta corriente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {medioPago === "CUENTA_CORRIENTE" && (
              <div className="space-y-2">
                <Label>Monto pagado ahora</Label>
                <Input
                  type="number"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-white/50">
                  El resto quedará en cuenta del cliente
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={lines.length === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Confirmar venta
            </Button>
            {lastVenta && (
              <ComprobanteVentaPdfButton ventaId={lastVenta.id} numero={lastVenta.numero} />
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar venta?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Se descontará stock y se registrará el movimiento. Total:{" "}
              <strong className="text-white">{formatARS(total)}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmar}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
