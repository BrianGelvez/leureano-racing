import Link from "next/link";
import { ProveedorForm } from "@/components/proveedores/proveedor-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NuevoProveedorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/proveedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-white">Nuevo proveedor</h2>
      </div>
      <ProveedorForm />
    </div>
  );
}
