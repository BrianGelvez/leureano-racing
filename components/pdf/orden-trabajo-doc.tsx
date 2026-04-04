import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 8 },
  section: { marginTop: 12 },
});

type Props = {
  negocio: { nombreNegocio: string; telefono: string | null } | null;
  orden: {
    numero: number;
    descripcionFalla: string;
    trabajoRealizado: string | null;
    motoMarca: string | null;
    motoModelo: string | null;
    motoPatente: string | null;
    costoManoObra: number;
    costoRepuestos: number;
    total: number;
    cliente: { nombre: string; apellido: string } | null;
    items: { cantidad: number; precioUnit: number; producto: { nombre: string } }[];
  };
};

export function OrdenTrabajoDoc({ orden, negocio }: Props) {
  const n = negocio?.nombreNegocio ?? "Laureano Racing";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{n}</Text>
        <Text>Orden de trabajo OT-{orden.numero}</Text>
        {negocio?.telefono && <Text>Tel: {negocio.telefono}</Text>}
        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Cliente</Text>
          <Text>
            {orden.cliente
              ? `${orden.cliente.nombre} ${orden.cliente.apellido}`
              : "—"}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Moto</Text>
          <Text>
            {orden.motoMarca} {orden.motoModelo} {orden.motoPatente ?? ""}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Falla</Text>
          <Text>{orden.descripcionFalla}</Text>
        </View>
        {orden.trabajoRealizado && (
          <View style={styles.section}>
            <Text style={{ fontWeight: "bold" }}>Trabajo realizado</Text>
            <Text>{orden.trabajoRealizado}</Text>
          </View>
        )}
        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Repuestos</Text>
          {orden.items.map((it, i) => (
            <Text key={i}>
              {it.producto.nombre} x{it.cantidad} @ ${it.precioUnit}
            </Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text>Mano de obra: ${orden.costoManoObra}</Text>
          <Text>Repuestos: ${orden.costoRepuestos}</Text>
          <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "bold" }}>
            Total: ${orden.total}
          </Text>
        </View>
        <View style={{ marginTop: 40 }}>
          <Text>_________________________</Text>
          <Text>Firma cliente</Text>
        </View>
      </Page>
    </Document>
  );
}
