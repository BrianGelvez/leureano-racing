"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrarCompra } from "@/app/actions/compras";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type P = { id: number; nombre: string };
type Prod = { id: number; nombre: string; precioCompra: number };

export function ProveedorCompraDialog({
  proveedor,
  productos,
}: {
  proveedor: P;
  productos: Prod[];
}) {
  const [open, setOpen] = useState(false);
  const [pid, setPid] = useState(String(productos[0]?.id ?? ""));
  const [cant, setCant] = useState(1);
  const [precio, setPrecio] = useState(productos[0]?.precioCompra ?? 0);
  const router = useRouter();

  async function registrar() {
    const res = await registrarCompra({
      proveedorId: proveedor.id,
      items: [
        {
          productoId: Number(pid),
          cantidad: cant,
          precioUnit: precio,
        },
      ],
    });
    setOpen(false);
    if (!res.ok) {
      toast.error("No se pudo registrar la compra");
      return;
    }
    toast.success("Compra registrada — stock actualizado");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Compra rápida
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compra a {proveedor.nombre}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Producto</Label>
          <Select
            value={pid}
            onValueChange={(v) => {
              setPid(v);
              const pr = productos.find((x) => x.id === Number(v));
              if (pr) setPrecio(pr.precioCompra);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productos.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              value={cant}
              onChange={(e) => setCant(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Precio unit. compra</Label>
            <Input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <Button onClick={registrar}>Confirmar compra</Button>
      </DialogContent>
    </Dialog>
  );
}
