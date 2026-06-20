# Guía de Instalación y Despliegue ⚙️

Sigue estos pasos para levantar el panel operativo **INTEGRA** en tu entorno local. El proyecto requiere Node.js, un gestor de paquetes (`pnpm` recomendado) y un servidor MySQL activo.

## Requisitos Previos

1.  **Node.js**: Versión 18.17.0 o superior.
2.  **Gestor de paquetes**: Se recomienda fuertemente usar `pnpm` (versión 8+).
3.  **Base de Datos**: Un servidor **MySQL** local (XAMPP, WAMP, MySQL Workbench) o en la nube (PlanetScale, Railway).

---

## 1. Instalación de Dependencias

Clona el repositorio e instala las dependencias usando `pnpm`:

```bash
git clone <url-del-repo> integra-panel
cd integra-panel
pnpm install
```

> ⚠️ **Seguridad de pnpm:** Si al instalar o ejecutar el proyecto ves un error que dice `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: @prisma/engines...`, es una medida de seguridad de pnpm bloqueando la descarga del motor de base de datos de Prisma. Para solucionarlo, ejecuta:
> ```bash
> pnpm approve-builds
> ```
> *(Presiona la letra `a` para seleccionar todo y luego `Enter` para aprobar los binarios de Prisma).*

## 2. Configuración de Variables de Entorno

El proyecto no incluye variables sensibles en el repositorio por seguridad. Debes crear tu propio archivo de entorno:

1.  Copia el archivo de ejemplo:
    ```bash
    cp .env.example .env.local
    ```
2.  Abre `.env.local` y configura la cadena de conexión a tu base de datos MySQL en la variable `DATABASE_URL`:
    ```env
    # Ejemplo para una base local
    DATABASE_URL="mysql://usuario:contraseña@localhost:3306/integra_db"
    ```

## 3. Configuración de la Base de Datos (Prisma)

Una vez configurado el `.env.local`, sincroniza el esquema de Prisma con tu base de datos MySQL:

```bash
# Crea las tablas automáticamente en la base de datos
npx prisma db push

# (Opcional) Genera los tipos de TypeScript del cliente de Prisma
npx prisma generate
```

>  **Nota:** Puedes usar `npx prisma studio` para abrir una interfaz gráfica en el navegador y explorar o modificar los datos de tu base de datos fácilmente.

## 4. Ejecución del Servidor de Desarrollo

Una vez que la base de datos esté lista y sincronizada, inicia el servidor de desarrollo de Next.js:

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 5. Preparación para Producción

Para compilar y ejecutar la aplicación en un entorno de producción (o simularlo localmente):

```bash
# 1. Audita las dependencias por seguridad
pnpm audit

# 2. Revisa que el código cumpla con el Linter
pnpm lint

# 3. Compila la aplicación (Aquí actuará TypeScript de forma estricta)
pnpm build

# 4. Inicia el servidor de producción
pnpm start
```

## 6. Conexión del Modelo de IA (Futuro)

El proyecto incluye un adaptador abstracto para Inteligencia Artificial.
Cuando tengas tu modelo entrenado o tu API lista, modifica el archivo `lib/ai-service.ts` y reemplaza la lógica de simulación interna con una petición `fetch` a tu servidor. La interfaz y el tipado (`SimulationResult`) ya están definidos para ti.
