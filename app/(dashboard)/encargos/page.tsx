import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EncargosTable } from "@/components/encargos/encargos-table";
import { Button } from "@/components/ui/button";

export default async function EncargosPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const encargos = await prisma.encargo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cliente: true,
      items: { include: { producto: true } },
    },
  });

  const filtered =
    searchParams.estado === "LLEGADO_AVISAR"
      ? encargos.filter((e) => e.estado === "LLEGADO_AVISAR")
      : encargos;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Encargos</h2>
          <p className="text-white/55">Pedidos a proveedor y avisos al cliente</p>
        </div>
        <Button asChild>
          <Link href="/encargos/nuevo">Nuevo encargo</Link>
        </Button>
      </div>
      <EncargosTable encargos={filtered} />
    </div>
  );
}
