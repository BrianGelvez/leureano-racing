"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { configNegocioSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { guardarConfiguracion } from "@/app/actions/config";
import { toast } from "sonner";

type Form = z.infer<typeof configNegocioSchema>;

export function ConfigForm({ defaultValues }: { defaultValues: Form }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(configNegocioSchema),
    defaultValues,
  });

  async function onSubmit(data: Form) {
    const res = await guardarConfiguracion(data);
    if (!res.ok) {
      toast.error("Revisá los datos");
      return;
    }
    toast.success("Configuración guardada");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Negocio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nombre</Label>
            <Input {...register("nombreNegocio")} />
          </div>
          <div>
            <Label>CUIT</Label>
            <Input {...register("cuit")} />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input {...register("direccion")} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input {...register("telefono")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label>Condición IVA</Label>
            <Input {...register("condicionIVA")} />
          </div>
          <div>
            <Label>Punto de venta ARCA</Label>
            <Input
              type="number"
              {...register("ptoVentaARCA", {
                setValueAs: (v) =>
                  v === "" || v == null ? null : Number(v),
              })}
            />
          </div>
        </CardContent>
      </Card>
      <Button type="submit">Guardar</Button>
    </form>
  );
}
