"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { emitirFacturaElectronica } from "@/lib/arca";
import { getVentaComprobanteData } from "@/app/actions/comprobantes";
import { guardarFacturaARCA } from "@/app/actions/ventas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function EmitirFacturaModal({ ventaId }: { ventaId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [numero, setNumero] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const d = await getVentaComprobanteData(ventaId);
      if (!d) return;
      const v = d.venta;
      const cuit = v.cliente?.dni ? `DNI ${v.cliente.dni}` : "Consumidor final";
      setPreview(
        JSON.stringify(
          {
            cuitCliente: cuit,
            monto: v.total,
            concepto: `Venta #${v.numero}`,
            fecha: new Date(v.createdAt as unknown as string).toISOString(),
            tipoComprobante: "FACTURA_B",
          },
          null,
          2
        )
      );
    })();
  }, [open, ventaId]);

  async function simularEmitir() {
    setLoading(true);
    try {
      const d = await getVentaComprobanteData(ventaId);
      if (!d) return;
      const r = await emitirFacturaElectronica({
        cuitCliente: d.venta.cliente?.dni ?? undefined,
        monto: d.venta.total,
        concepto: `Venta #${d.venta.numero}`,
        fecha: new Date(d.venta.createdAt as unknown as string).toISOString(),
        tipoComprobante: "FACTURA_B",
      });
      toast.message(r.mensaje);
      if (numero.trim()) {
        await guardarFacturaARCA(ventaId, numero.trim());
        toast.success("N° ARCA guardado en la venta");
        router.refresh();
      }
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          Factura ARCA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Emitir factura electrónica (ARCA)</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/60">
          La integración con ARCA está en desarrollo. Datos que se enviarían:
        </p>
        <pre className="max-h-40 overflow-auto rounded-md bg-black/40 p-3 text-xs text-white/80">
          {preview || "…"}
        </pre>
        <div className="space-y-2">
          <Label>N° comprobante ARCA (simulado — guardar en venta)</Label>
          <Input
            placeholder="0001-00001234"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </div>
        <Button onClick={simularEmitir} disabled={loading}>
          {loading ? "Procesando…" : "Confirmar simulación"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
