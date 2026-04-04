# Laureano Racing — MVP de gestión

Web app para **venta de repuestos/accesorios** y **taller de motos**: dashboard, productos, ventas, órdenes de trabajo, clientes, proveedores, encargos, caja, reportes y configuración (incluye pantalla preparada para facturación ARCA).

## Requisitos

- Node.js 18+
- npm

## Puesta en marcha

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). La pantalla de login usa:

- **Email:** `admin@laureanoracing.com`
- **Contraseña:** `admin123`

## Variables de entorno

Copiá `.env` (ya incluido en el repo para el MVP local) o creá uno con:

- `DATABASE_URL="file:./dev.db"`
- `NEXTAUTH_SECRET` — cadena secreta para firmar sesiones
- `NEXTAUTH_URL` — URL base (ej. `http://localhost:3000`)

## Stack

Next.js 14 (App Router), TypeScript, Prisma + SQLite, Tailwind, componentes estilo shadcn, NextAuth (credenciales), React Hook Form + Zod, Zustand, Sonner, TanStack Table, Recharts, `@react-pdf/renderer`, date-fns (es).

## Logo

El logo del negocio debe estar en `public/logo.png` (incluido a partir del asset del proyecto).

## Notas

- Las operaciones de negocio usan **Server Actions** (sin API REST en este MVP).
- La integración real con **ARCA/AFIP** está encapsulada en `lib/arca.ts` como stub; la UI ya permite simular el flujo y guardar el número de comprobante en la venta.
