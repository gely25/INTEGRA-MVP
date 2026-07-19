# INTEGRA — Panel Operativo del Traslado Renal

INTEGRA es un panel operativo de custodia y trazabilidad diseñado para monitorear el traslado de órganos donantes (en este caso, un riñón) en tiempo real.

La plataforma simula un entorno crítico de logística médica, garantizando la cadena de frío, la integridad del contenedor y proporcionando telemetría continua mediante integración con IoT e Inteligencia Artificial.

---

# Características Implementadas

- Dashboard operativo del traslado renal.
- Gestión de casos.
- Registro de eventos de custodia.
- Telemetría simulada del contenedor.
- Alertas en tiempo real.
- Gestión de usuarios mediante autenticación.
- Inicio y cierre de sesión.
- Protección de rutas mediante Middleware.
- Gestión de roles (RBAC):
  - Coordinador
  - Transportador
  - Hospital Receptor
  - Auditor

---

# Próximas Funcionalidades

## Trazabilidad Completa (Simulación Blockchain)

Registro inmutable de eventos de custodia:

- Creación del caso
- Inicio del traslado
- Alertas
- Cambios de estado

## Telemetría IoT + Inteligencia Artificial

- Temperatura interna
- Temperatura externa
- Nivel de batería
- Posición GPS
- Detección automática de anomalías mediante IA

## Gemelo Operativo 3D

Visualización digital del estado del órgano y del contenedor durante el traslado.

---

# Gestión por Roles (RBAC)

Actualmente el sistema cuenta con autenticación mediante correo y contraseña.

Cada usuario posee un rol determinado.

| Rol | Función |
|------|----------|
| Coordinador | Administración completa del traslado |
| Transportador | Seguimiento del traslado |
| Hospital | Recepción del órgano |
| Auditor | Consulta del historial y trazabilidad |

Las rutas protegidas utilizan Middleware de Next.js para impedir el acceso sin autenticación.

---

# Stack Tecnológico

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Modo Estricto)
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Base de Datos ORM:** [Prisma](https://www.prisma.io/) (Preparado para MySQL)
*   **Componentes UI:** Construido con Radix UI y diseño base de [shadcn/ui](https://ui.shadcn.com/)
*   **Iconografía:** [Lucide React](https://lucide.dev/)

---

# Base de Datos

El proyecto utiliza Prisma ORM con MySQL.

Modelos principales:

- User
- Case
- Event
- Alert
- Telemetry

Modelo de usuario:

```prisma
model User {
  id        String   @id @default(cuid())
  nombre    String
  email     String   @unique
  password  String
  role      Role

  createdAt DateTime @default(now())
}



## Estructura del Proyecto

```text
integra-panel/
│
├── app/
│   ├── api/
│   │   ├── login/
│   │   └── logout/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── blocks/
│   ├── ui/
│   └── views/
│
├── lib/
│   ├── ai-service.ts
│   ├── db.ts
│   └── store.tsx
│
├── prisma/
│   └── schema.prisma
│
├── middleware.ts
│
└── public/
```

## Guías Adicionales

*   Para instalar y ejecutar el proyecto localmente, consulta la [Guía de Instalación](./INSTALLATION_GUIDE.md).
*   Para conocer las normas de seguridad, convenciones de código y arquitectura, consulta la [Guía de Buenas Prácticas](./BEST_PRACTICES.md).
