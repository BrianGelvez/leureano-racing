"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productoSchema } from "@/lib/validations";
import type { z } from "zod";
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
import { crearProducto, actualizarProducto } from "@/app/actions/productos";
import { toast } from "sonner";
import { useState } from "react";

type Form = z.infer<typeof productoSchema>;

export function ProductoForm({
  categorias,
  proveedores,
  defaultValues,
  productoId,
  extraBeforeSubmit,
  redirectAfterUpdate = "/productos",
}: {
  categorias: { id: number; nombre: string }[];
  proveedores: { id: number; nombre: string }[];
  defaultValues?: Partial<Form>;
  productoId?: number;
  /** Contenido antes del botón Guardar (ej. imágenes) */
  extraBeforeSubmit?: ReactNode;
  /** Tras actualizar un producto existente */
  redirectAfterUpdate?: string;
}) {
  const router = useRouter();
  const [pctPub, setPctPub] = useState("40");
  const [pctRev, setPctRev] = useState("30");

  const form = useForm<Form>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: "",
      stockActual: 0,
      stockMinimo: 2,
      precioCompra: 0,
      precioPublico: 0,
      precioRevendedor: 0,
      categoriaId: categorias[0]?.id ?? 0,
      activo: true,
      ...defaultValues,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const compra = watch("precioCompra");
  const precioPublico = watch("precioPublico");
  const precioCompraVal = watch("precioCompra");
  const margenPub =
    precioCompraVal > 0
      ? Math.round(((precioPublico - precioCompraVal) / precioCompraVal) * 1000) / 10
      : 0;

  async function onSubmit(data: Form) {
    const res = productoId
      ? await actualizarProducto(productoId, data)
      : await crearProducto(data);
    if (!res.ok) {
      if ("error" in res && res.error) {
        toast.error("Revisá los campos del formulario");
      } else toast.error("No se pudo guardar");
      return;
    }
    toast.success(productoId ? "Producto actualizado" : "Producto creado");
    if (productoId) {
      router.push(redirectAfterUpdate);
    } else if ("id" in res && typeof res.id === "number") {
      router.push(`/productos/${res.id}/editar`);
    } else {
      router.push("/productos");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Nombre</Label>
            <Input {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-red-400">{errors.nombre.message}</p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Descripción</Label>
            <Textarea {...register("descripcion")} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Código interno</Label>
            <Input {...register("codigo")} />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={String(watch("categoriaId"))}
              onValueChange={(v) => setValue("categoriaId", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Select
              value={
                watch("proveedorId") ? String(watch("proveedorId")) : "none"
              }
              onValueChange={(v) =>
                setValue("proveedorId", v === "none" ? null : Number(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin proveedor</SelectItem>
                {proveedores.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input {...register("marca")} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Compatibilidad (motos)</Label>
            <Input
              {...register("compatibilidad")}
              placeholder="Honda Wave 110, Zanella ZB 110"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Stock y precios</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Stock actual</Label>
            <Input type="number" {...register("stockActual")} />
          </div>
          <div className="space-y-2">
            <Label>Stock mínimo</Label>
            <Input type="number" {...register("stockMinimo")} />
          </div>
          <div className="space-y-2">
            <Label>Precio compra</Label>
            <Input type="number" step="0.01" {...register("precioCompra")} />
          </div>
          <div className="space-y-2">
            <Label>Precio público</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.01" {...register("precioPublico")} />
              <div className="flex gap-1">
                <Input
                  className="w-16"
                  value={pctPub}
                  onChange={(e) => setPctPub(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const c = Number(compra) || 0;
                    const pct = Number(pctPub) / 100;
                    setValue("precioPublico", Math.round(c * (1 + pct)));
                  }}
                >
                  %
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Precio revendedor</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                {...register("precioRevendedor")}
              />
              <div className="flex gap-1">
                <Input
                  className="w-16"
                  value={pctRev}
                  onChange={(e) => setPctRev(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const c = Number(compra) || 0;
                    const pct = Number(pctRev) / 100;
                    setValue("precioRevendedor", Math.round(c * (1 + pct)));
                  }}
                >
                  %
                </Button>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-white/70">
            Margen sobre costo (precio público):{" "}
            <span className="font-semibold text-emerald-400">{margenPub}%</span>
          </div>
        </CardContent>
      </Card>

      {extraBeforeSubmit}

      <Button type="submit" size="lg">
        Guardar producto
      </Button>
    </form>
  );
}
