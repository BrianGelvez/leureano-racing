"use client";

import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { getOrdenComprobanteData } from "@/app/actions/comprobantes";
import { OrdenTrabajoDoc } from "@/components/pdf/orden-trabajo-doc";
import { toast } from "sonner";

export function OrdenPdfButton({ ordenId, numero }: { ordenId: number; numero: number }) {
  async function download() {
    const data = await getOrdenComprobanteData(ordenId);
    if (!data) {
      toast.error("Orden no encontrada");
      return;
    }
    try {
      const blob = await pdf(
        <OrdenTrabajoDoc orden={data.orden} negocio={data.negocio} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orden-${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF generado");
    } catch {
      toast.error("Error al generar PDF");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={download}>
      <FileDown className="mr-2 h-4 w-4" />
      PDF orden
    </Button>
  );
}
