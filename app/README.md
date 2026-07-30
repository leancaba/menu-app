# Menú Digital – Carta interactiva

App de menú digital (Next.js 14 + Tailwind) con 4 pantallas para el cliente
y un panel de administración para editar todo sin tocar código.

## Qué incluye

**Experiencia del cliente (`/`)**
1. Bienvenida: "¿Qué elegís hoy?" con las categorías (Desayuno/Merienda,
   Almuerzo/Cena, Cositas Ricas, Novedades). Transición animada entre pantallas.
2. Subcategorías (Bebidas / Dulce / Salado, etc.) cuando la categoría las tiene.
3. Productos con precio, botón "+" para sumarlos al pedido, y al tocar el
   nombre se despliega una foto/ilustración y descripción del producto.
4. Botón flotante "Mi pedido" (visible en todas las pantallas, con contador)
   que abre un resumen con lista de ítems, botón "✕" para quitarlos y el total.

**Panel de administración (`/admin`)**, protegido con contraseña:
- **Apariencia**: nombre del local, texto de bienvenida, logo (imagen o letra),
  colores (fondo, superficie, texto, acento), tipografías, símbolo de moneda.
- **Categorías**: crear/editar/eliminar categorías y sus subcategorías,
  marcar categorías como "destacadas" (se muestran en negrita).
- **Productos**: crear/editar/eliminar, asignar categoría/subcategoría,
  precio, descripción, ícono de reemplazo y foto propia (máx. 1.5 MB, se
  valida tanto en el navegador como en el servidor).

## Cómo correrlo en tu máquina

```bash
npm install
cp .env.example .env.local   # y editá ADMIN_PASSWORD si querés
npm run dev
```

Abrí `http://localhost:3000` (carta) y `http://localhost:3000/admin` (panel).
La contraseña por defecto es `admin123` (cambiala en `.env.local`).

En este modo local, los cambios del admin se guardan en `data/menu.json`.

## Cómo subirlo a Vercel para mostrárselo al cliente

1. Subí esta carpeta a un repositorio de GitHub (sin `node_modules` ni `.next`,
   ya están excluidos en `.gitignore`).
2. Entrá a [vercel.com](https://vercel.com) → **Add New Project** → importá
   el repositorio → Deploy (no hace falta tocar ninguna configuración,
   Vercel detecta Next.js automáticamente).
3. En **Settings → Environment Variables** agregá `ADMIN_PASSWORD` con la
   contraseña que quieras usar para el panel en esa demo.
4. Listo: vas a tener una URL tipo `tuproyecto.vercel.app` para compartir.

### Importante: persistencia de los cambios del admin en Vercel

Las funciones de Vercel tienen el sistema de archivos de solo lectura, así que
guardar en `data/menu.json` (como hace en local) **no funciona ahí**. Para que
los cambios del panel de admin queden guardados de verdad en la demo:

1. En el proyecto de Vercel andá a **Storage → Marketplace Database Providers
   → Redis** y conectalo (tiene un plan gratuito de sobra para esto).
2. Vercel agrega automáticamente la variable de entorno con las credenciales
   al proyecto — según qué proveedor elijas puede ser `REDIS_URL` (conexión
   estándar) o el par `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
   (API REST de Upstash). El código soporta ambos formatos automáticamente.
3. Volvé a desplegar (Vercel lo hace solo al detectar la nueva integración) y
   el admin va a guardar ahí en lugar del archivo local. Todo esto vive en
   `lib/store.js`, sin que tengas que cambiar nada más.

Si no conectás Redis, el admin va a funcionar igual durante la demo (podés
editar y ver los cambios en esa sesión), pero al reiniciarse la función se
pierden. Es la mejor opción para mostrarlo rápido sin infraestructura.

## Cuando lo mudes al dominio/servidor definitivo del cliente

- Si el hosting final tiene un sistema de archivos persistente (VPS propio,
  por ejemplo), `data/menu.json` funciona sin cambios.
- Si es otro entorno serverless (como Vercel), lo más simple es mantener la
  conexión a Redis, o migrar `lib/store.js` a la base de datos que el cliente
  ya tenga contratada (Postgres, MySQL, etc.) — la función expone solo dos
  métodos (`getMenu` y `saveMenu`), así que el resto de la app no necesita
  tocarse.

## Estructura del proyecto

```
app/
  page.js              → orquesta las 4 pantallas del cliente
  admin/page.js         → panel de administración
  api/menu/route.js     → GET/PUT del menú completo
  api/admin-auth/route.js → verifica la contraseña del admin
components/            → pantallas y piezas de UI reutilizables
lib/
  defaultData.js        → carta de ejemplo inicial
  store.js              → guarda/lee el menú (archivo local o Redis)
  useCart.js             → maneja el pedido del cliente (sessionStorage)
  theme.js               → aplica los colores/tipografías configurados
data/menu.json          → "base de datos" en desarrollo local
```

## Notas de diseño

- Tipografías: Sora (títulos) + Work Sans (texto), cargadas desde Google
  Fonts en `app/layout.js`. Podés cambiarlas por otras del menú del admin,
  pero si querés una familia nueva hay que agregar su link de Google Fonts
  ahí también.
- Los productos sin foto propia muestran un ícono ilustrativo genérico
  (café, jugo, factura, sándwich, etc.) dibujado a medida — subí una foto
  real desde el admin para reemplazarlo en cualquier producto.
- El logo por defecto es una insignia genérica con la inicial del local;
  subí el isotipo real del cliente desde **Apariencia → Logo**.

## Pendiente / a definir con el cliente

- Autenticación del admin: hoy es una única contraseña compartida
  (suficiente para la demo). Para producción real conviene un login por
  usuario si más de una persona va a administrar la carta.
- Impresión del pedido / envío al mozo: la app arma el pedido en pantalla
  para que el cliente se lo muestre al mozo; si más adelante quieren que el
  pedido se envíe automáticamente (impresora, WhatsApp, sistema de caja),
  es un desarrollo aparte que puedo ayudar a sumar.
