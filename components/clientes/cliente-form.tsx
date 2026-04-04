"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema } from "@/lib/validations";
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
import { crearCliente, actualizarCliente } from "@/app/actions/clientes";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Form = z.infer<typeof clienteSchema>;

export function ClienteForm({
  clienteId,
  defaultValues,
  afterSaveRedirect = "/clientes",
}: {
  clienteId?: number;
  defaultValues?: Partial<Form>;
  /** `null` = no redirigir, solo refrescar */
  afterSaveRedirect?: string | null;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      tipoCliente: "MINORISTA",
      ...defaultValues,
    },
  });

  async function onSubmit(data: Form) {
    const res = clienteId
      ? await actualizarCliente(clienteId, data)
      : await crearCliente(data);
    if (!res.ok) {
      toast.error("Revisá los datos");
      return;
    }
    toast.success(clienteId ? "Cliente actualizado" : "Cliente creado");
    if (afterSaveRedirect) router.push(afterSaveRedirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-red-400">{errors.nombre.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Apellido</Label>
            <Input {...register("apellido")} />
          </div>
          <div className="space-y-2">
            <Label>DNI / CUIT</Label>
            <Input {...register("dni")} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input {...register("telefono")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Dirección</Label>
            <Input {...register("direccion")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tipo</Label>
            <Select
              value={watch("tipoCliente")}
              onValueChange={(v) => setValue("tipoCliente", v as Form["tipoCliente"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MINORISTA">Minorista</SelectItem>
                <SelectItem value="MAYORISTA">Mayorista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notas</Label>
            <Textarea {...register("notas")} rows={3} />
          </div>
        </CardContent>
      </Card>
      <Button type="submit">Guardar</Button>
    </form>
  );
}
