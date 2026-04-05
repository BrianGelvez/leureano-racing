# Laureano Racing — MVP de gestión

Web app para **venta de repuestos/accesorios** y **taller de motos**: dashboard, productos, ventas, órdenes de trabajo, clientes, proveedores, encargos, caja, reportes y configuración (incluye pantalla preparada para facturación ARCA).

## Requisitos

- **Node.js 18+** (recomendado 20 LTS)
- **npm**

## Trabajar desde otra PC (GitHub + misma base de datos de demo)

El repositorio **no incluye** el archivo SQLite ni `.env` (secretos y datos locales). En cada máquina obtenés **la misma base de datos de demostración** aplicando migraciones y el seed (mismos productos, usuario admin, etc.).

### 1. Subir el proyecto a GitHub (solo la primera vez, en la PC actual)

1. Asegurate de **no** tener `.env` en el historial con secretos reales. Si antes se commiteó `.env`, ejecutá:
   ```bash
   git rm --cached .env
   git commit -m "Dejar de versionar .env"
   ```
2. Creá el repo en GitHub y enlazalo:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

### 2. Clonar en la otra PC

```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
npm install
```

### 3. Variables de entorno

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Editá `.env` y poné un **`NEXTAUTH_SECRET`** propio (cadena larga y aleatoria). En Node podés generar uno:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Base de datos (misma data de demo que el seed)

Crea `prisma/dev.db`, aplica migraciones y carga datos iniciales:

```bash
npm run db:setup
```

Equivale a `prisma migrate deploy` + `prisma db seed`.

### 5. Arrancar

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

**Login de demostración** (creado por el seed):

- **Email:** `admin@laureanoracing.com`
- **Contraseña:** `admin123`

### Si ya desarrollás migraciones nuevas en una PC

En la otra PC, después de `git pull`:

```bash
npm install
npm run db:setup
```

Si solo agregaste migraciones sin tocar el seed, alcanza con `npm run db:migrate`. Si el seed cambió y querés resetear todo el SQLite local:

```bash
npx prisma migrate reset
```

(Confirma el prompt; borra datos locales y vuelve a migrar + seed.)

## Scripts útiles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:setup` | Migraciones + seed (entorno nuevo) |
| `npm run db:migrate` | Solo migraciones |
| `npm run db:seed` | Solo seed (requiere DB ya migrada) |

## Variables de entorno

| Variable | Ejemplo | Uso |
|----------|---------|-----|
| `DATABASE_URL` | `file:./dev.db` | SQLite en `prisma/dev.db` |
| `NEXTAUTH_SECRET` | (secreto largo) | Firma de sesiones NextAuth |
| `NEXTAUTH_URL` | `http://localhost:3000` | URL base de la app |

## Stack

Next.js 14 (App Router), TypeScript, Prisma + SQLite, Tailwind, componentes estilo shadcn, NextAuth (credenciales), React Hook Form + Zod, Zustand, Sonner, TanStack Table, Recharts, `@react-pdf/renderer`, date-fns (es).

## Logo

El logo debe estar en `public/logo.png`.

## Notas

- Las operaciones de negocio usan **Server Actions** (sin API REST en este MVP).
- Las **imágenes de productos** se guardan en `public/uploads/productos/` (ignoradas por git salvo `.gitkeep`); en cada clon hay que volver a subirlas o copiar esa carpeta si las necesitás.
- La integración real con **ARCA/AFIP** está en `lib/arca.ts` como stub.
