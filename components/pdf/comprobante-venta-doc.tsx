import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 4 },
  th: { flex: 1, fontWeight: "bold", borderBottomWidth: 1, paddingBottom: 4 },
  td: { flex: 1, paddingVertical: 4 },
  total: { marginTop: 12, fontSize: 14, fontWeight: "bold" },
});

type Props = {
  negocio: {
    nombreNegocio: string;
    cuit: string | null;
    direccion: string | null;
    telefono: string | null;
  } | null;
  venta: {
    numero: number;
    createdAt: Date;
    total: number;
    subtotal: number;
    descuento: number;
    medioPago: string;
    tipoPrecio: string;
    cliente: {
      nombre: string;
      apellido: string;
      dni: string | null;
    } | null;
    items: {
      cantidad: number;
      precioUnit: number;
      subtotal: number;
      producto: { nombre: string };
    }[];
  };
};

export function ComprobanteVentaDoc({ venta, negocio }: Props) {
  const n = negocio?.nombreNegocio ?? "Laureano Racing";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{n}</Text>
        <Text>Comprobante de venta #{venta.numero}</Text>
        <Text style={{ marginBottom: 12 }}>
          {new Date(venta.createdAt).toLocaleString("es-AR")}
        </Text>
        {negocio?.cuit && <Text>CUIT: {negocio.cuit}</Text>}
        {negocio?.direccion && <Text>{negocio.direccion}</Text>}
        {negocio?.telefono && <Text>Tel: {negocio.telefono}</Text>}
        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Cliente</Text>
          <Text>
            {venta.cliente
              ? `${venta.cliente.nombre} ${venta.cliente.apellido}${venta.cliente.dni ? ` · DNI ${venta.cliente.dni}` : ""}`
              : "Mostrador / ocasional"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.th}>Producto</Text>
          <Text style={styles.th}>Cant.</Text>
          <Text style={styles.th}>P. unit.</Text>
          <Text style={styles.th}>Subtotal</Text>
        </View>
        {venta.items.map((it, i) => (
          <View style={styles.row} key={i}>
            <Text style={styles.td}>{it.producto.nombre}</Text>
            <Text style={styles.td}>{it.cantidad}</Text>
            <Text style={styles.td}>${it.precioUnit.toFixed(0)}</Text>
            <Text style={styles.td}>${it.subtotal.toFixed(0)}</Text>
          </View>
        ))}
        <Text style={{ marginTop: 8 }}>Subtotal: ${venta.subtotal.toFixed(0)}</Text>
        {venta.descuento > 0 && (
          <Text>Descuento: -${venta.descuento.toFixed(0)}</Text>
        )}
        <Text style={styles.total}>Total: ${venta.total.toFixed(0)}</Text>
        <Text>Medio de pago: {venta.medioPago.replace(/_/g, " ")}</Text>
        <Text>Lista de precios: {venta.tipoPrecio}</Text>
      </Page>
    </Document>
  );
}
