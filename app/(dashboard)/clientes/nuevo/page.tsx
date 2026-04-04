import Link from "next/link";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Nuevo cliente</h2>
        </div>
      </div>
      <ClienteForm />
    </div>
  );
}
