import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function clear() {
  await prisma.itemVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.itemOrdenTrabajo.deleteMany();
  await prisma.ordenEstadoHistorial.deleteMany();
  await prisma.ordenTrabajo.deleteMany();
  await prisma.itemCompra.deleteMany();
  await prisma.compra.deleteMany();
  await prisma.movimientoStock.deleteMany();
  await prisma.itemEncargo.deleteMany();
  await prisma.encargo.deleteMany();
  await prisma.movimientoCuenta.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.configuracionNegocio.deleteMany();
}

async function main() {
  await clear();

  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@laureanoracing.com",
      password: hash,
      name: "Administrador",
    },
  });

  await prisma.configuracionNegocio.create({
    data: {
      id: 1,
      nombreNegocio: "Laureano Racing",
      cuit: "20-12345678-9",
      direccion: "Av. Corrientes 1234, CABA",
      telefono: "+54 11 4000-0000",
      email: "info@laureanoracing.com",
      condicionIVA: "Monotributo",
      ptoVentaARCA: 1,
    },
  });

  const cats = [
    "Frenos",
    "Motor",
    "Transmisión",
    "Eléctrico/Encendido",
    "Suspensión",
    "Carrocería",
    "Aceites y Lubricantes",
    "Accesorios",
    "Neumáticos",
  ];
  const categorias: Record<string, number> = {};
  for (const n of cats) {
    const c = await prisma.categoria.create({ data: { nombre: n } });
    categorias[n] = c.id;
  }

  const provs = await Promise.all([
    prisma.proveedor.create({
      data: {
        nombre: "Distribuidora Moto Norte",
        contacto: "Carlos Méndez",
        telefono: "+54 11 5000-1111",
        email: "ventas@motonorte.com.ar",
      },
    }),
    prisma.proveedor.create({
      data: {
        nombre: "Repuestos Central",
        contacto: "Laura Gómez",
        telefono: "+54 11 5000-2222",
        email: "pedidos@repuestoscentral.com",
      },
    }),
    prisma.proveedor.create({
      data: {
        nombre: "ImportMoto SRL",
        contacto: "Roberto Paz",
        telefono: "+54 11 5000-3333",
        email: "import@motoimport.com",
      },
    }),
  ]);

  const productosData = [
    {
      nombre: "Pastillas de freno Honda Wave 110",
      codigo: "FR-WAVE110",
      categoriaId: categorias["Frenos"],
      proveedorId: provs[0].id,
      stockActual: 24,
      stockMinimo: 4,
      precioCompra: 3500,
      precioPublico: 6500,
      precioRevendedor: 5200,
      marca: "Fuji",
      compatibilidad: "Honda Wave 110, Zanella ZB 110",
    },
    {
      nombre: "Cadena 428H reforzada",
      codigo: "TR-428H",
      categoriaId: categorias["Transmisión"],
      proveedorId: provs[1].id,
      stockActual: 15,
      stockMinimo: 3,
      precioCompra: 12000,
      precioPublico: 22000,
      precioRevendedor: 18500,
      marca: "RK",
      compatibilidad: "Universal 428",
    },
    {
      nombre: "Bujía NGK CR7HSA",
      codigo: "EL-NGKCR7",
      categoriaId: categorias["Eléctrico/Encendido"],
      proveedorId: provs[0].id,
      stockActual: 40,
      stockMinimo: 5,
      precioCompra: 1800,
      precioPublico: 3800,
      precioRevendedor: 3000,
      marca: "NGK",
      compatibilidad: "Honda, Yamaha 110cc",
    },
    {
      nombre: "Aceite 20W50 mineral 1L",
      codigo: "AC-20W50",
      categoriaId: categorias["Aceites y Lubricantes"],
      proveedorId: provs[1].id,
      stockActual: 60,
      stockMinimo: 10,
      precioCompra: 2800,
      precioPublico: 5200,
      precioRevendedor: 4500,
      marca: "Motul",
      compatibilidad: "4T universal",
    },
    {
      nombre: "Faro LED universal 6 pulgadas",
      codigo: "CR-LED6",
      categoriaId: categorias["Carrocería"],
      proveedorId: provs[2].id,
      stockActual: 8,
      stockMinimo: 2,
      precioCompra: 8500,
      precioPublico: 16500,
      precioRevendedor: 13800,
      marca: "Generic LED",
      compatibilidad: "Universal",
    },
    {
      nombre: "Manoplas c/ balancín",
      codigo: "AC-MANO",
      categoriaId: categorias["Accesorios"],
      proveedorId: provs[0].id,
      stockActual: 1,
      stockMinimo: 3,
      precioCompra: 4500,
      precioPublico: 8900,
      precioRevendedor: 7200,
      marca: "ProGrip",
      compatibilidad: "22mm",
    },
    {
      nombre: "Filtro de aire Honda Wave",
      codigo: "MT-FAWAVE",
      categoriaId: categorias["Motor"],
      proveedorId: provs[1].id,
      stockActual: 18,
      stockMinimo: 4,
      precioCompra: 2200,
      precioPublico: 4500,
      precioRevendedor: 3600,
      marca: "Honda OEM style",
      compatibilidad: "Honda Wave 110",
    },
    {
      nombre: "Kit de arrastre 428",
      codigo: "TR-KIT428",
      categoriaId: categorias["Transmisión"],
      proveedorId: provs[1].id,
      stockActual: 6,
      stockMinimo: 2,
      precioCompra: 18500,
      precioPublico: 34000,
      precioRevendedor: 28500,
      marca: "Sunstar",
      compatibilidad: "Honda CG 125",
    },
    {
      nombre: "Disco de freno delantero Wave",
      codigo: "FR-DISCW",
      categoriaId: categorias["Frenos"],
      proveedorId: provs[0].id,
      stockActual: 4,
      stockMinimo: 2,
      precioCompra: 12000,
      precioPublico: 24000,
      precioRevendedor: 19500,
      marca: "Ferodo",
      compatibilidad: "Honda Wave 110",
    },
    {
      nombre: "Batería 12V 7Ah gel",
      codigo: "EL-BAT7",
      categoriaId: categorias["Eléctrico/Encendido"],
      proveedorId: provs[2].id,
      stockActual: 10,
      stockMinimo: 2,
      precioCompra: 15000,
      precioPublico: 28000,
      precioRevendedor: 23500,
      marca: "Moura",
      compatibilidad: "Motos 110-150cc",
    },
    {
      nombre: "Neumático Pirelli 2.75-17 MT60",
      codigo: "NE-PI275",
      categoriaId: categorias["Neumáticos"],
      proveedorId: provs[2].id,
      stockActual: 5,
      stockMinimo: 2,
      precioCompra: 28000,
      precioPublico: 52000,
      precioRevendedor: 45000,
      marca: "Pirelli",
      compatibilidad: "Delantero 110cc",
    },
    {
      nombre: "Cable de embrague",
      codigo: "TR-CABEMB",
      categoriaId: categorias["Transmisión"],
      proveedorId: provs[0].id,
      stockActual: 12,
      stockMinimo: 3,
      precioCompra: 3200,
      precioPublico: 6500,
      precioRevendedor: 5200,
      marca: "Tecno",
      compatibilidad: "Honda CG 150",
    },
    {
      nombre: "Carburador VM22",
      codigo: "MT-VM22",
      categoriaId: categorias["Motor"],
      proveedorId: provs[2].id,
      stockActual: 3,
      stockMinimo: 2,
      precioCompra: 22000,
      precioPublico: 42000,
      precioRevendedor: 35000,
      marca: "Mikuni style",
      compatibilidad: "Pit bike, 110-125",
    },
    {
      nombre: "Bobina de encendido",
      codigo: "EL-BOB",
      categoriaId: categorias["Eléctrico/Encendido"],
      proveedorId: provs[0].id,
      stockActual: 9,
      stockMinimo: 2,
      precioCompra: 6500,
      precioPublico: 12500,
      precioRevendedor: 10200,
      marca: "Denso style",
      compatibilidad: "Honda Wave 110",
    },
    {
      nombre: "Guantes moto verano M",
      codigo: "AC-GUM",
      categoriaId: categorias["Accesorios"],
      proveedorId: provs[1].id,
      stockActual: 14,
      stockMinimo: 4,
      precioCompra: 5500,
      precioPublico: 11000,
      precioRevendedor: 9200,
      marca: "Alpine style",
      compatibilidad: "Talle M",
    },
    {
      nombre: "Guantes moto verano L",
      codigo: "AC-GUL",
      categoriaId: categorias["Accesorios"],
      proveedorId: provs[1].id,
      stockActual: 11,
      stockMinimo: 4,
      precioCompra: 5500,
      precioPublico: 11000,
      precioRevendedor: 9200,
      marca: "Alpine style",
      compatibilidad: "Talle L",
    },
    {
      nombre: "Casco abierto Jet negro mate",
      codigo: "AC-CASJET",
      categoriaId: categorias["Accesorios"],
      proveedorId: provs[2].id,
      stockActual: 7,
      stockMinimo: 2,
      precioCompra: 28000,
      precioPublico: 52000,
      precioRevendedor: 44000,
      marca: "LS2 style",
      compatibilidad: "Talle L",
    },
    {
      nombre: "Amortiguador trasero regulable",
      codigo: "SU-AMORT",
      categoriaId: categorias["Suspensión"],
      proveedorId: provs[0].id,
      stockActual: 4,
      stockMinimo: 2,
      precioCompra: 32000,
      precioPublico: 58000,
      precioRevendedor: 49000,
      marca: "YSS style",
      compatibilidad: "Honda Wave 110",
    },
    {
      nombre: "Espejo retrovisor par",
      codigo: "CR-ESP",
      categoriaId: categorias["Carrocería"],
      proveedorId: provs[1].id,
      stockActual: 20,
      stockMinimo: 4,
      precioCompra: 2500,
      precioPublico: 5500,
      precioRevendedor: 4400,
      marca: "Universal",
      compatibilidad: "Rosca M10",
    },
    {
      nombre: "Pastillas traseras Yamaha Crypton",
      codigo: "FR-CRYPT",
      categoriaId: categorias["Frenos"],
      proveedorId: provs[0].id,
      stockActual: 0,
      stockMinimo: 2,
      precioCompra: 3000,
      precioPublico: 6200,
      precioRevendedor: 5000,
      marca: "Fuji",
      compatibilidad: "Yamaha Crypton",
    },
  ];

  const productos = [];
  for (const p of productosData) {
    const prod = await prisma.producto.create({
      data: {
        ...p,
        descripcion: `Repuesto ${p.nombre}`,
        activo: true,
      },
    });
    productos.push(prod);
    await prisma.movimientoStock.create({
      data: {
        productoId: prod.id,
        tipo: "ENTRADA",
        cantidad: prod.stockActual,
        motivo: "AJUSTE_MANUAL",
        referencia: "seed",
      },
    });
  }

  const clientesMin = await Promise.all([
    prisma.cliente.create({
      data: {
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "+54 11 6000-1001",
        email: "juan.perez@gmail.com",
        dni: "32123456",
        tipoCliente: "MINORISTA",
        direccion: "Villa Lugano",
        saldoPendiente: 0,
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "María",
        apellido: "González",
        telefono: "+54 11 6000-1002",
        dni: "28987654",
        tipoCliente: "MINORISTA",
        saldoPendiente: 15000,
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Lucas",
        apellido: "Fernández",
        telefono: "+54 11 6000-1003",
        tipoCliente: "MINORISTA",
        saldoPendiente: 0,
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Soledad",
        apellido: "Ramírez",
        telefono: "+54 11 6000-1004",
        tipoCliente: "MINORISTA",
        saldoPendiente: 8200,
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Diego",
        apellido: "Acosta",
        telefono: "+54 11 6000-1005",
        tipoCliente: "MINORISTA",
        saldoPendiente: 0,
      },
    }),
  ]);

  const clientesMay = await Promise.all([
    prisma.cliente.create({
      data: {
        nombre: "Taller",
        apellido: "El Rayo",
        telefono: "+54 11 7000-2001",
        dni: "30711223344",
        tipoCliente: "MAYORISTA",
        saldoPendiente: 45000,
        notas: "Cliente mayorista zona Oeste",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Motos",
        apellido: "San Martín SRL",
        telefono: "+54 11 7000-2002",
        dni: "30755667788",
        tipoCliente: "MAYORISTA",
        saldoPendiente: 0,
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Repuestos",
        apellido: "Delta",
        telefono: "+54 11 7000-2003",
        tipoCliente: "MAYORISTA",
        saldoPendiente: 120000,
      },
    }),
  ]);

  for (const c of [clientesMin[1], clientesMin[3], clientesMay[0], clientesMay[2]]) {
    if (c.saldoPendiente > 0) {
      await prisma.movimientoCuenta.create({
        data: {
          clienteId: c.id,
          tipo: "CARGO",
          monto: c.saldoPendiente,
          descripcion: "Saldo inicial demo",
          referencia: "seed",
        },
      });
    }
  }

  const allClientes = [...clientesMin, ...clientesMay];
  const medios = ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "CUENTA_CORRIENTE"] as const;

  for (let i = 0; i < 10; i++) {
    const day = new Date();
    day.setDate(day.getDate() - (i % 7));
    const p1 = productos[i % productos.length];
    const p2 = productos[(i + 3) % productos.length];
    const cant1 = 1 + (i % 3);
    const cant2 = i % 2;
    const cliente = allClientes[i % allClientes.length];
    const mayor = cliente.tipoCliente === "MAYORISTA";
    const u1 = mayor ? p1.precioRevendedor : p1.precioPublico;
    const u2 = mayor ? p2.precioRevendedor : p2.precioPublico;
    const line1 = cant1 * u1;
    const line2 = cant2 > 0 ? cant2 * u2 : 0;
    const sub = line1 + line2;
    const desc = i % 4 === 0 ? sub * 0.05 : 0;
    const total = sub - desc;
    const medio = medios[i % medios.length];
    let estadoPago = "PAGADO";
    let montoPagado = total;
    if (medio === "CUENTA_CORRIENTE") {
      estadoPago = i % 2 === 0 ? "PENDIENTE" : "PARCIAL";
      montoPagado = estadoPago === "PENDIENTE" ? 0 : total * 0.5;
    }

    const itemsCreate = [
      {
        productoId: p1.id,
        cantidad: cant1,
        precioUnit: u1,
        subtotal: line1,
      },
      ...(cant2 > 0
        ? [
            {
              productoId: p2.id,
              cantidad: cant2,
              precioUnit: u2,
              subtotal: line2,
            },
          ]
        : []),
    ];

    const venta = await prisma.venta.create({
      data: {
        numero: i + 1,
        clienteId: cliente.id,
        subtotal: sub,
        descuento: desc,
        total,
        medioPago: medio,
        estadoPago,
        montoPagado,
        tipoPrecio: mayor ? "REVENDEDOR" : "PUBLICO",
        notas: i % 3 === 0 ? "Cliente habitual" : undefined,
        createdAt: day,
        items: { create: itemsCreate },
      },
    });

    for (const it of await prisma.itemVenta.findMany({ where: { ventaId: venta.id } })) {
      await prisma.producto.update({
        where: { id: it.productoId },
        data: { stockActual: { decrement: it.cantidad } },
      });
      await prisma.movimientoStock.create({
        data: {
          productoId: it.productoId,
          tipo: "SALIDA",
          cantidad: it.cantidad,
          motivo: "VENTA",
          referencia: String(venta.id),
        },
      });
    }

    if (medio === "CUENTA_CORRIENTE" && total - montoPagado > 0) {
      await prisma.cliente.update({
        where: { id: cliente.id },
        data: { saldoPendiente: { increment: total - montoPagado } },
      });
      await prisma.movimientoCuenta.create({
        data: {
          clienteId: cliente.id,
          tipo: "CARGO",
          monto: total - montoPagado,
          descripcion: `Venta #${venta.numero}`,
          referencia: `VENTA:${venta.id}`,
        },
      });
    }
  }

  const estadosOrden = [
    "RECIBIDA",
    "EN_PROCESO",
    "ESPERANDO_REPUESTO",
    "LISTA",
    "ENTREGADA",
  ] as const;

  for (let i = 0; i < 5; i++) {
    const prodOrden = productos[i % 18];
    const pu = prodOrden.precioPublico;
    const orden = await prisma.ordenTrabajo.create({
      data: {
        numero: i + 1,
        clienteId: allClientes[i].id,
        motoMarca: ["Honda", "Yamaha", "Zanella", "Gilera", "Motomel"][i],
        motoModelo: ["Wave 110", "Crypton", "ZB 110", "Smash", "Strato"][i],
        motoPatente: `AB${100 + i}CD`,
        motoAnio: 2018 + i,
        kilometraje: 12000 + i * 500,
        descripcionFalla: ["No enciende", "Freno delantero", "Ruido en cadena", "Corte a altas", "Service completo"][i],
        estado: estadosOrden[i],
        costoManoObra: 15000 + i * 2000,
        costoRepuestos: pu,
        total: 15000 + i * 2000 + pu,
        medioPago: i === 4 ? "EFECTIVO" : null,
        estadoPago: i === 4 ? "PAGADO" : "PENDIENTE",
        fechaEstimada: new Date(Date.now() + (i + 1) * 86400000),
        items: {
          create: [
            {
              productoId: prodOrden.id,
              cantidad: 1,
              precioUnit: pu,
              subtotal: pu,
            },
          ],
        },
      },
    });

    await prisma.ordenEstadoHistorial.create({
      data: { ordenId: orden.id, estado: "RECIBIDA" },
    });
    if (orden.estado !== "RECIBIDA") {
      await prisma.ordenEstadoHistorial.create({
        data: { ordenId: orden.id, estado: orden.estado },
      });
    }

    for (const it of await prisma.itemOrdenTrabajo.findMany({
      where: { ordenId: orden.id },
    })) {
      await prisma.producto.update({
        where: { id: it.productoId },
        data: { stockActual: { decrement: it.cantidad } },
      });
      await prisma.movimientoStock.create({
        data: {
          productoId: it.productoId,
          tipo: "SALIDA",
          cantidad: it.cantidad,
          motivo: "USO_TALLER",
          referencia: String(orden.id),
        },
      });
    }
  }

  const encEstados = ["PENDIENTE", "PEDIDO", "LLEGADO_AVISAR"] as const;
  for (let i = 0; i < 3; i++) {
    const pe = productos[19];
    await prisma.encargo.create({
      data: {
        clienteId: allClientes[i].id,
        estado: encEstados[i],
        notas: "Encargo demo",
        items: {
          create: [
            {
              productoId: pe.id,
              descripcion: pe.nombre,
              cantidad: 1 + i,
            },
          ],
        },
      },
    });
  }

  console.log("Seed OK: admin@laureanoracing.com / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
