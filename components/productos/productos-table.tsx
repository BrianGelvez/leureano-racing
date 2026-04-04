"use client";

import * as React from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Package, Search } from "lucide-react";
import { formatARS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductoThumbnail } from "@/components/productos/producto-thumbnail";

export type ProductoRow = {
  id: number;
  nombre: string;
  codigo: string | null;
  stockActual: number;
  stockMinimo: number;
  precioPublico: number;
  precioRevendedor: number;
  categoriaId: number;
  categoria: { nombre: string };
  imagenPrincipal?: string | null;
};

function stockVariant(stock: number, min: number) {
  if (stock === 0) return "danger" as const;
  if (stock <= min) return "warning" as const;
  return "success" as const;
}

export function ProductosTable({
  data,
  categorias,
  initialStockFilter,
}: {
  data: ProductoRow[];
  categorias: { id: number; nombre: string }[];
  initialStockFilter?: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [catId, setCatId] = React.useState<string>("all");
  const [stockFilter, setStockFilter] = React.useState<string>(
    initialStockFilter === "bajo" ? "bajo" : "all"
  );

  const columns = React.useMemo<ColumnDef<ProductoRow>[]>(
    () => [
      {
        id: "imagen",
        header: "Imagen",
        cell: ({ row }) => (
          <ProductoThumbnail src={row.original.imagenPrincipal} size={40} />
        ),
      },
      {
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-white">{row.original.nombre}</p>
            {row.original.codigo && (
              <p className="text-xs text-white/45">{row.original.codigo}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "categoria.nombre",
        header: "Categoría",
        cell: ({ row }) => row.original.categoria.nombre,
      },
      {
        accessorKey: "stockActual",
        header: "Stock",
        cell: ({ row }) => {
          const v = stockVariant(
            row.original.stockActual,
            row.original.stockMinimo
          );
          return (
            <Badge
              variant={
                v === "success"
                  ? "success"
                  : v === "warning"
                    ? "warning"
                    : "danger"
              }
            >
              {row.original.stockActual} / mín {row.original.stockMinimo}
            </Badge>
          );
        },
      },
      {
        accessorKey: "precioPublico",
        header: "Público",
        cell: ({ row }) => formatARS(row.original.precioPublico),
      },
      {
        accessorKey: "precioRevendedor",
        header: "Revendedor",
        cell: ({ row }) => formatARS(row.original.precioRevendedor),
      },
      {
        id: "acciones",
        header: "",
        cell: ({ row }) => (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/productos/${row.original.id}`}>Ver</Link>
          </Button>
        ),
      },
    ],
    []
  );

  const filtered = React.useMemo(() => {
    let rows = data;
    if (catId !== "all") {
      const id = Number(catId);
      rows = rows.filter((r) => r.categoriaId === id);
    }
    if (stockFilter === "bajo") {
      rows = rows.filter((r) => r.stockActual <= r.stockMinimo);
    } else if (stockFilter === "agotado") {
      rows = rows.filter((r) => r.stockActual === 0);
    }
    return rows;
  }, [data, catId, stockFilter]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _id, filter) => {
      const q = String(filter).toLowerCase();
      const n = row.original.nombre.toLowerCase();
      const c = (row.original.codigo ?? "").toLowerCase();
      return n.includes(q) || c.includes(q);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Buscar por nombre o código…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={catId} onValueChange={setCatId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el stock</SelectItem>
              <SelectItem value="bajo">Stock bajo / mínimo</SelectItem>
              <SelectItem value="agotado">Agotado</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/productos/nuevo">Nuevo producto</Link>
          </Button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-white/10 hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-white/50">
                    <Package className="h-10 w-10 opacity-40" />
                    <p>No hay productos que coincidan con los filtros.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
