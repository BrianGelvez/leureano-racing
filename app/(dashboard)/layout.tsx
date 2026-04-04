import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { stockActual: true, stockMinimo: true },
  });
  const stockBajo = productos.filter(
    (p) => p.stockActual <= p.stockMinimo
  ).length;

  const encargosAvisar = await prisma.encargo.count({
    where: { estado: "LLEGADO_AVISAR" },
  });

  return (
    <DashboardShell
      userName={session.user.name}
      userEmail={session.user.email}
      stockBajo={stockBajo}
      encargosAvisar={encargosAvisar}
    >
      {children}
    </DashboardShell>
  );
}
