"use client";

import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { getVentaComprobanteData } from "@/app/actions/comprobantes";
import { ComprobanteVentaDoc } from "@/components/pdf/comprobante-venta-doc";
import { toast } from "sonner";

export function ComprobanteVentaPdfButton({
  ventaId,
  numero,
}: {
  ventaId: number;
  numero: number;
}) {
  async function download() {
    const data = await getVentaComprobanteData(ventaId);
    if (!data) {
      toast.error("No se encontró la venta");
      return;
    }
    try {
      const blob = await pdf(
        <ComprobanteVentaDoc venta={data.venta} negocio={data.negocio} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `venta-${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF generado");
    } catch {
      toast.error("Error al generar PDF");
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={download}>
      <FileDown className="mr-2 h-4 w-4" />
      Imprimir comprobante PDF
    </Button>
  );
}
