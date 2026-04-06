"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { crearProducto, actualizarProducto } from "@/app/actions/productos";
import { toast } from "sonner";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

type Form = z.infer<typeof productoSchema>;

export function ProductoForm({
  categorias,
  proveedores,
  defaultValues,
  productoId,
  extraBeforeSubmit,
  redirectAfterUpdate = "/productos",
  postCreateStayOnPage,
  renderImagenes,
}: {
  categorias: { id: number; nombre: string }[];
  proveedores: { id: number; nombre: string }[];
  defaultValues?: Partial<Form>;
  productoId?: number;
  /** Contenido antes del botón Guardar (ej. imágenes) */
  extraBeforeSubmit?: ReactNode;
  /** Tras actualizar un producto existente */
  redirectAfterUpdate?: string;
  /** En alta: tras crear no redirige; habilita imágenes en la misma vista */
  postCreateStayOnPage?: boolean;
  /** Galería cuando ya hay `productoId` o un producto recién creado en esta vista */
  renderImagenes?: (id: number) => ReactNode;
}) {
  const router = useRouter();
  const [pctPub, setPctPub] = useState("40");
  const [pctRev, setPctRev] = useState("30");
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);

  const effectiveProductoId = productoId ?? createdProductId ?? undefined;

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
    const res = effectiveProductoId
      ? await actualizarProducto(effectiveProductoId, data)
      : await crearProducto(data);
    if (!res.ok) {
      if ("error" in res && res.error) {
        toast.error("Revisá los campos del formulario");
      } else toast.error("No se pudo guardar");
      return;
    }
    if (effectiveProductoId) {
      toast.success(productoId ? "Producto actualizado" : "Cambios guardados");
      if (productoId) {
        router.push(redirectAfterUpdate);
      }
      router.refresh();
      return;
    }
    if ("id" in res && typeof res.id === "number") {
      toast.success("Producto creado");
      if (postCreateStayOnPage) {
        setCreatedProductId(res.id);
        router.refresh();
        return;
      }
      router.push(`/productos/${res.id}/editar`);
      router.refresh();
      return;
    }
    router.push("/productos");
    router.refresh();
  }

  const submitLabel = !effectiveProductoId
    ? "Crear producto"
    : "Guardar cambios";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
          <CardDescription>
            Nombre, categoría y datos que verás en fichas y ventas.
          </CardDescription>
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
          <CardDescription>
            Usá los botones % para calcular precios desde el costo.
          </CardDescription>
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

      {postCreateStayOnPage && createdProductId && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-100/90">
          El producto ya está en el sistema. Podés subir fotos abajo y seguir
          ajustando datos; tocá &quot;Guardar cambios&quot; cuando termines.
        </div>
      )}

      {renderImagenes &&
        (effectiveProductoId ? (
          <Card className="border-white/10 shadow-[0_0_0_1px_rgba(224,16,16,0.12)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#E01010]" aria-hidden />
                Imágenes del producto
              </CardTitle>
              <CardDescription>
                La primera imagen es la portada en listados y búsquedas.
                Arrastrá para reordenar.
              </CardDescription>
            </CardHeader>
            <CardContent>{renderImagenes(effectiveProductoId)}</CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-white/15 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/90">
                <ImageIcon className="h-5 w-5 text-white/40" aria-hidden />
                Imágenes
              </CardTitle>
              <CardDescription>
                Paso 2: después de crear el producto vas a poder subir JPG, PNG
                o WebP (máx. 5 MB cada una).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm text-white/45"
                aria-hidden
              >
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/50">
                  Pendiente de crear
                </span>
                Completá los datos y tocá &quot;Crear producto&quot;.
              </div>
            </CardContent>
          </Card>
        ))}

      {extraBeforeSubmit}

      <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
        {postCreateStayOnPage && createdProductId != null && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button variant="secondary" asChild className="w-full sm:w-auto">
              <Link href={`/productos/${createdProductId}`}>Ver ficha</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/productos">Ir al listado</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link href="/productos/nuevo">Crear otro producto</Link>
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
