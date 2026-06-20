# Guía de Buenas Prácticas y Seguridad  

Para asegurar que **INTEGRA** sea escalable, seguro y fácil de mantener, este repositorio sigue pautas estrictas en arquitectura de frontend, seguridad de datos y convenciones de código. Cualquier nuevo desarrollo debe adherirse a estas prácticas.

---

## 1. Seguridad Frontend y Headers HTTP

*   **No confíes en el Cliente:** La seguridad real **siempre** debe ocurrir en el servidor (API Routes o Backend). Las restricciones en la interfaz de React (como deshabilitar botones o bloquear pantallas) son puramente por Experiencia de Usuario (UX), no son seguridad verdadera.
*   **Headers de Seguridad:** La aplicación configura cabeceras críticas en `next.config.mjs` como `X-Frame-Options` (contra Clickjacking) y `X-Content-Type-Options` (MIME sniffing). Si agregas scripts externos de IA en el futuro, implementa un Content-Security-Policy (CSP) estricto.
*   **Manejo de Secretos:** 
    *   **NUNCA** pongas contraseñas, tokens JWT, o API Keys sensibles en el código fuente.
    *   Si una variable de entorno **no** necesita ser leída por el navegador, no uses el prefijo `NEXT_PUBLIC_`.
*   **XSS (Cross-Site Scripting):** Evita bajo cualquier circunstancia usar `dangerouslySetInnerHTML`. React ya sanitiza las variables incrustadas por defecto.

## 2. Convenciones de Código y TypeScript

*   **Modo Estricto Activado:** TypeScript está configurado en modo estricto, y el comando de build fallará si hay errores de tipado. **No deshabilites esta protección**.
*   **Tipos e Interfaces:** Declara tipos explícitos para respuestas de API y estados globales en archivos dedicados (como `lib/case-data.ts`). Prohibido el uso de la palabra clave `any`.
*   **Manejo de Errores:** 
    *   **UI:** Toda la aplicación está envuelta en un componente `<ErrorBoundary>` para evitar que un error de JS deje la pantalla en blanco al usuario.
    *   **APIs:** Todo endpoint en `app/api/...` debe tener bloques `try/catch` y nunca debe devolver stack traces o mensajes de error directos de SQL al frontend.

## 3. Arquitectura del Proyecto

*   **Adaptadores de Servicios (AI y DB):** Los servicios externos no deben ser llamados directamente desde los componentes visuales.
    *   La base de datos se maneja mediante el singleton en `lib/db.ts`.
    *   La Inteligencia artificial se encapsula tras el adaptador en `lib/ai-service.ts`.
*   **Componentes Pequeños:** Evita componentes monstruosos de miles de líneas. Divide la UI en atómicos (`components/ui`) y bloques compuestos (`components/blocks`).

## 4. Auditoría de Dependencias

Antes de cualquier despliegue a producción, es un requisito correr:
```bash
pnpm audit
```
*No agregues librerías grandes sin justificación si solo necesitas una función pequeña (por ejemplo, prefiere `Intl.DateTimeFormat` nativo antes de instalar `moment.js`).*

## 5. Accesibilidad (a11y)

*   Asegúrate de que los botones e inputs tengan atributos `aria-label` descriptivos, especialmente si solo contienen íconos (ej. el menú de demo).
*   Las alertas de emergencia o errores críticos deben usar `role="alert"` para que sean anunciados inmediatamente por lectores de pantalla.
