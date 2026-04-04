"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearCategoria, eliminarCategoria } from "@/app/actions/categorias";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Cat = {
  id: number;
  nombre: string;
  _count: { productos: number };
};

export function CategoriasClient({ categorias }: { categorias: Cat[] }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [delId, setDelId] = useState<number | null>(null);

  async function crear() {
    const res = await crearCategoria({ nombre });
    if (!res.ok) {
      toast.error("Nombre inválido o duplicado");
      return;
    }
    setNombre("");
    toast.success("Categoría creada");
    router.refresh();
  }

  async function eliminar() {
    if (delId == null) return;
    const res = await eliminarCategoria(delId);
    setDelId(null);
    if (!res.ok) {
      toast.error("message" in res ? res.message : "Error");
      return;
    }
    toast.success("Eliminada");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <Input
            placeholder="Nueva categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={crear} disabled={!nombre.trim()}>
            Agregar
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((c) => (
          <Card key={c.id} className="border-white/10">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium text-white">{c.nombre}</p>
                <p className="text-xs text-white/45">
                  {c._count.productos} productos
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400"
                onClick={() => setDelId(c.id)}
                disabled={c._count.productos > 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={delId != null} onOpenChange={() => setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminar}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
