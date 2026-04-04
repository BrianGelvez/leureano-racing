/**
 * Stub para integración futura con ARCA / AFIP facturación electrónica.
 * Reemplazar con llamadas reales a WSFE / certificados .p12.
 */

export type ArcaFacturaPayload = {
  cuitCliente?: string;
  monto: number;
  concepto: string;
  fecha: string;
  tipoComprobante: string;
};

export async function emitirFacturaElectronica(
  payload: ArcaFacturaPayload
): Promise<{ ok: false; mensaje: string }> {
  void payload;
  return {
    ok: false,
    mensaje:
      "Integración ARCA en desarrollo. Los datos fueron validados localmente.",
  };
}
