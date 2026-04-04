"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bike,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: "red" | "amber";
  children?: { href: string; label: string }[];
};

const nav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/categorias", label: "Categorías", icon: Tag },
  {
    href: "/ventas/nueva",
    label: "Ventas",
    icon: ShoppingCart,
    children: [
      { href: "/ventas/nueva", label: "Nueva venta" },
      { href: "/ventas/historial", label: "Historial" },
    ],
  },
  {
    href: "/taller/ordenes",
    label: "Taller",
    icon: Wrench,
    children: [
      { href: "/taller/ordenes", label: "Órdenes" },
      { href: "/taller/nueva-orden", label: "Nueva orden" },
    ],
  },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/proveedores", label: "Proveedores", icon: Truck },
  { href: "/encargos", label: "Encargos", icon: ClipboardList },
  { href: "/caja", label: "Caja", icon: Wallet },
  { href: "/reportes", label: "Reportes", icon: FileText },
  {
    href: "/configuracion",
    label: "Configuración",
    icon: Settings,
    children: [
      { href: "/configuracion", label: "General" },
      { href: "/configuracion/facturacion", label: "Facturación ARCA" },
    ],
  },
];

function NavLink({
  item,
  onNavigate,
  stockBajo,
  encargosAvisar,
}: {
  item: NavItem;
  onNavigate?: () => void;
  stockBajo: number;
  encargosAvisar: number;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href)) ||
    item.children?.some((c) => pathname === c.href);

  let badge: number | undefined;
  let badgeVariant: "red" | "amber" | undefined;
  if (item.href === "/productos" && stockBajo > 0) {
    badge = stockBajo;
    badgeVariant = "amber";
  }
  if (item.href === "/encargos" && encargosAvisar > 0) {
    badge = encargosAvisar;
    badgeVariant = "red";
  }

  if (item.children) {
    return (
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            active ? "bg-[#E01010]/20 text-white" : "text-white/70"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
        </div>
        <div className="ml-6 space-y-0.5 border-l border-white/10 pl-3">
          {item.children.map((c) => {
            const subActive = pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm transition-colors",
                  subActive
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#E01010]/25 text-white shadow-[0_0_16px_rgba(224,16,16,0.15)]"
          : "text-white/70 hover:bg-white/[0.06] hover:text-white"
      )}
    >
      <span className="relative">
        <Icon className="h-4 w-4" />
        {badge != null && badge > 0 && (
          <span
            className={cn(
              "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
              badgeVariant === "amber" ? "bg-amber-500" : "bg-[#E01010]"
            )}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      {item.label}
    </Link>
  );
}

function SidebarInner({
  stockBajo,
  encargosAvisar,
  onNavigate,
}: {
  stockBajo: number;
  encargosAvisar: number;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
        <div className="relative h-16 w-full right-6">
          <Image
            src="/logo.png"
            alt="Laureano Racing"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>
      <ScrollArea className="flex-1 -mx-2">
        <nav className="flex flex-col gap-1 pr-3">
          {nav.map((item) => (
            <NavLink
              key={item.href + item.label}
              item={item}
              onNavigate={onNavigate}
              stockBajo={stockBajo}
              encargosAvisar={encargosAvisar}
            />
          ))}
        </nav>
      </ScrollArea>
      <Separator className="my-4 bg-white/10" />
      <div className="flex items-center gap-2 px-2 text-xs text-white/40">
        <Bike className="h-4 w-4" />
        <span>Laureano Racing MVP</span>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  stockBajo,
  encargosAvisar,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  stockBajo: number;
  encargosAvisar: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const title =
    nav.find((n) => n.href === pathname)?.label ??
    nav.flatMap((n) => n.children ?? []).find((c) => c.href === pathname)
      ?.label ??
    "Panel";

  return (
    <div className="flex min-h-screen">
      <aside className="glass-sidebar hidden w-64 shrink-0 border-r border-white/[0.06] p-4 md:flex md:flex-col">
        <SidebarInner
          stockBajo={stockBajo}
          encargosAvisar={encargosAvisar}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#080808]/80 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4 md:hidden">
                <SidebarInner
                  stockBajo={stockBajo}
                  encargosAvisar={encargosAvisar}
                  onNavigate={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/45">
                Laureano Racing
              </p>
              <h1 className="text-sm font-semibold text-white md:text-base">
                {title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stockBajo > 0 && (
              <Link href="/productos?stock=bajo">
                <span className="hidden rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 sm:inline">
                  Stock bajo: {stockBajo}
                </span>
              </Link>
            )}
            {encargosAvisar > 0 && (
              <Link href="/encargos?estado=LLEGADO_AVISAR">
                <span className="hidden rounded-full border border-[#E01010]/40 bg-[#E01010]/10 px-3 py-1 text-xs text-red-400 sm:inline">
                  Encargos para avisar: {encargosAvisar}
                </span>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-white/90">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {(userName || userEmail || "A").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[120px] truncate text-sm lg:inline">
                    {userName || userEmail}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-white/10 bg-[#141414] text-white"
              >
                <DropdownMenuItem
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Salir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
