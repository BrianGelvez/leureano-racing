import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá la contraseña"),
});

export const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  codigo: z.string().optional(),
  categoriaId: z.coerce.number().int().positive("Elegí una categoría"),
  proveedorId: z.coerce.number().int().optional().nullable(),
  stockActual: z.coerce.number().int().min(0),
  stockMinimo: z.coerce.number().int().min(0),
  precioCompra: z.coerce.number().min(0),
  precioPublico: z.coerce.number().min(0),
  precioRevendedor: z.coerce.number().min(0),
  marca: z.string().optional(),
  compatibilidad: z.string().optional(),
  activo: z.boolean().optional(),
});

export const categoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

export const clienteSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  apellido: z.string().min(1, "Apellido obligatorio"),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
  tipoCliente: z.enum(["MINORISTA", "MAYORISTA"]),
  notas: z.string().optional(),
});

export const proveedorSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notas: z.string().optional(),
});

export const ajusteStockSchema = z.object({
  productoId: z.coerce.number().int(),
  nuevoStock: z.coerce.number().int().min(0),
  motivo: z.string().min(3, "Describí el motivo (mín. 3 caracteres)"),
});

export const ventaItemSchema = z.object({
  productoId: z.number().int(),
  cantidad: z.number().int().positive(),
  precioUnit: z.number().min(0),
});

export const crearVentaSchema = z.object({
  clienteId: z.number().int().nullable().optional(),
  tipoPrecio: z.enum(["PUBLICO", "REVENDEDOR"]),
  descuentoTipo: z.enum(["NINGUNO", "PORCENTAJE", "MONTO"]),
  descuentoValor: z.coerce.number().min(0),
  medioPago: z.enum([
    "EFECTIVO",
    "TRANSFERENCIA",
    "TARJETA",
    "CUENTA_CORRIENTE",
  ]),
  montoPagado: z.coerce.number().min(0),
  notas: z.string().optional(),
  items: z.array(ventaItemSchema).min(1, "Agregá al menos un producto"),
});

export const ordenTrabajoSchema = z.object({
  clienteId: z.number().int().nullable().optional(),
  motoMarca: z.string().optional(),
  motoModelo: z.string().optional(),
  motoPatente: z.string().optional(),
  motoAnio: z.coerce.number().int().optional().nullable(),
  kilometraje: z.coerce.number().int().optional().nullable(),
  descripcionFalla: z.string().min(5, "Describí la falla"),
  costoManoObra: z.coerce.number().min(0),
  fechaEstimada: z.string().optional(),
  notas: z.string().optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int(),
        cantidad: z.number().int().positive(),
        precioUnit: z.number().min(0),
      })
    )
    .optional(),
});

export const movimientoPagoSchema = z.object({
  clienteId: z.coerce.number().int(),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  descripcion: z.string().min(2, "Descripción obligatoria"),
});

export const compraSchema = z.object({
  proveedorId: z.coerce.number().int().positive(),
  notas: z.string().optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int(),
        cantidad: z.number().int().positive(),
        precioUnit: z.number().min(0),
      })
    )
    .min(1, "Agregá al menos un ítem"),
});

export const encargoSchema = z.object({
  clienteId: z.coerce.number().int().positive(),
  notas: z.string().optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().nullable().optional(),
        descripcion: z.string().min(1, "Descripción obligatoria"),
        cantidad: z.coerce.number().int().positive(),
      })
    )
    .min(1),
});

export const configNegocioSchema = z.object({
  nombreNegocio: z.string().min(1),
  cuit: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  condicionIVA: z.string().optional(),
  ptoVentaARCA: z.number().int().nullable().optional(),
});
