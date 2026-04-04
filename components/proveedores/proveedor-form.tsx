"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proveedorSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crearProveedor } from "@/app/actions/proveedores";
import { toast } from "sonner";

type Form = z.infer<typeof proveedorSchema>;

export function ProveedorForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: { nombre: "" },
  });

  async function onSubmit(data: Form) {
    const res = await crearProveedor(data);
    if (!res.ok) {
      toast.error("Datos inválidos");
      return;
    }
    toast.success("Proveedor creado");
    router.push("/proveedores");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nombre</Label>
            <Input {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-red-400">{errors.nombre.message}</p>
            )}
          </div>
          <div>
            <Label>Contacto</Label>
            <Input {...register("contacto")} />
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
            <Label>Notas</Label>
            <Textarea {...register("notas")} rows={3} />
          </div>
        </CardContent>
      </Card>
      <Button type="submit">Guardar</Button>
    </form>
  );
}
