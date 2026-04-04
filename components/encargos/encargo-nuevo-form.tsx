"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { encargoSchema } from "@/lib/validations";
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
import { crearEncargo } from "@/app/actions/encargos";
import { toast } from "sonner";

type Form = z.infer<typeof encargoSchema>;

export function EncargoNuevoForm({
  clientes,
  productos,
  defaultProductoId,
}: {
  clientes: { id: number; nombre: string; apellido: string }[];
  productos: { id: number; nombre: string }[];
  defaultProductoId?: number;
}) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<Form>({
    resolver: zodResolver(encargoSchema),
    defaultValues: {
      clienteId: clientes[0]?.id ?? 0,
      items: [
        {
          productoId: defaultProductoId ?? null,
          descripcion:
            productos.find((p) => p.id === defaultProductoId)?.nombre ??
            "",
          cantidad: 1,
        },
      ],
      notas: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  async function onSubmit(data: Form) {
    const res = await crearEncargo(data);
    if (!res.ok) {
      toast.error("Revisá los datos");
      return;
    }
    toast.success("Encargo creado");
    router.push("/encargos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={String(watch("clienteId"))}
            onValueChange={(v) => setValue("clienteId", Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre} {c.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ítems</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ productoId: null, descripcion: "", cantidad: 1 })
            }
          >
            Agregar línea
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-2 rounded-lg border border-white/10 p-3 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <Label>Producto (opcional)</Label>
                <Select
                  value={
                    watch(`items.${index}.productoId`)
                      ? String(watch(`items.${index}.productoId`))
                      : "libre"
                  }
                  onValueChange={(v) => {
                    if (v === "libre") {
                      setValue(`items.${index}.productoId`, null);
                    } else {
                      const id = Number(v);
                      setValue(`items.${index}.productoId`, id);
                      const pr = productos.find((p) => p.id === id);
                      if (pr) setValue(`items.${index}.descripcion`, pr.nombre);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="libre">Texto libre</SelectItem>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Descripción</Label>
                <Input {...register(`items.${index}.descripcion`)} />
              </div>
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" onClick={() => remove(index)}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <Label>Notas</Label>
        <Textarea {...register("notas")} rows={2} />
      </div>

      <Button type="submit">Crear encargo</Button>
    </form>
  );
}
