# INTEGRA — Panel Operativo del Traslado Renal 

**INTEGRA** es un panel operativo de custodia y trazabilidad diseñado para monitorear el traslado de órganos donantes (en este caso, un riñón) en tiempo real. La plataforma simula un entorno crítico de logística médica, garantizando la cadena de frío, la integridad del contenedor y proporcionando telemetría continua mediante integración con IoT e Inteligencia Artificial.

---

## Futuras Características Principales

*   **Trazabilidad Completa (Simulación Blockchain):** Registro inmutable de eventos de custodia (creación del caso, inicio de traslado, alertas).
*   **Telemetría IoT en Tiempo Real (Simulado con IA y Backend):** Monitoreo continuo de la temperatura interna y externa, batería del contenedor y posición GPS.
*   **Gemelo Operativo 3D:** Visualización del estado digital del órgano y las condiciones de su entorno.
*   **Gestión por Roles (RBAC):** Interfaces personalizadas dependiendo del actor logístico:
    *    **Coordinador:** Visión global, control de isquemia y mando de alertas.
    *    **Transportador:** Resumen de ruta, progreso y estado del hardware.
    *    **Hospital Receptor:** Checklist estricto de recepción validando cadena de frío y firmas criptográficas.
    *    **Auditor:** Resumen forense para evaluar la integridad del traslado post-mortem.
*   **Integración Abierta con Inteligencia Artificial:** Arquitectura lista para conectar modelos de predicción de anomalías basados en la telemetría del contenedor.

## Stack Tecnológico

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Modo Estricto)
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Base de Datos ORM:** [Prisma](https://www.prisma.io/) (Preparado para MySQL)
*   **Componentes UI:** Construido con Radix UI y diseño base de [shadcn/ui](https://ui.shadcn.com/)
*   **Iconografía:** [Lucide React](https://lucide.dev/)

## Estructura del Proyecto

```text
integra-panel/
├── app/               # Rutas de la aplicación (Next.js App Router)
│   ├── api/           # Endpoints del servidor (MySQL y Servicios AI)
│   ├── layout.tsx     # Layout principal y Error Boundaries
│   └── page.tsx       # Página principal (Dashboard)
├── components/        # Componentes UI reutilizables
│   ├── blocks/        # Bloques complejos (gráficos, trazabilidad)
│   ├── ui/            # Componentes atómicos (botones, inputs)
│   └── views/         # Vistas específicas por cada rol (RBAC)
├── lib/               # Utilidades, esquemas y lógica de negocio
│   ├── ai-service.ts  # Adaptador genérico para Inteligencia Artificial
│   ├── db.ts          # Instancia global del cliente de Prisma
│   └── store.tsx      # Gestor de estado global de la simulación
├── prisma/            # Esquemas de base de datos MySQL
└── public/            # Assets estáticos (imágenes, iconos)
```

## Guías Adicionales

*   Para instalar y ejecutar el proyecto localmente, consulta la [Guía de Instalación](./INSTALLATION_GUIDE.md).
*   Para conocer las normas de seguridad, convenciones de código y arquitectura, consulta la [Guía de Buenas Prácticas](./BEST_PRACTICES.md).
