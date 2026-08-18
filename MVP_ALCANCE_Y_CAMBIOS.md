# INTEGRA-MVP — Alcance de la Plataforma y Registro de Cambios Implementados

## 1. Alcance General del MVP (Scope)

**INTEGRA** es un prototipo operativo y arquitectónico de alta fidelidad diseñado para demostrar la trazabilidad inmutable, la seguridad Zero-Trust y el monitoreo IoT/IA en el traslado crítico de órganos donantes (específicamente transporte renal).

La plataforma valida en la práctica la integración entre sistemas sanitarios legados (INCUCAI/SINTRA, Hospitales Donantes/Receptores), redes blockchain permisionadas (**Hyperledger Fabric** con canales `custody-channel` y `audit-channel`), sensores Edge IoT y motores de Inteligencia Artificial para la detección de anomalías.

---

## 2. Matriz RBAC y Principio de Mínimo Privilegio (PoLP)

El MVP implementa de manera estricta la separación de funciones según la matriz RBAC (Tablas 3 y 8 de las especificaciones del sistema):

| Rol / Actor | Identidad y Credencial | Custodia IoT (Telemetría) | Expediente Clínico | Firma / Aprobación | Logs & Infraestructura |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Coordinador Nacional (INCUCAI)** | Certificado Root CA + MFA (TOTP) | No (Solo estatus agragado) | Sí | Sí (Firma de Asignación) | No |
| **Hospital Receptor** | Certificado Org CA + mTLS | Sí (Verificación recepción) | Sí | Sí (Firma de Acuerdo / Recepción) | No |
| **Auditor Externo** | Certificado Audit (Solo lectura, `audit=true`) | Sí (Lectura total post-mortem/tránsito) | No | No (0% capacidad escritura) | Sí (audit-channel) |
| **Transportador Operativo** | Token de Sesión de Traslado | Sí (Lectura y resolución de alertas operativas) | No | No | No |
| **Proveedor IT (Tercerizado)** | Acceso Zero-Trust / PAM (`PAM-9482`) | **NO** (Restringido por PoLP) | **NO** | **NO** | **SÍ** (Consola de infraestructura grabada) |
| **Dispositivo IoT** | Certificado IoT CA (mTLS, TTL 72h) | Emisión continua de lecturas | No | No | No |

---

## 3. Registro de Cambios Implementados (Change Log)

### 3.1. Reconstrucción Estricta de la Vista del Auditor Externo (`auditor-view.tsx`)
- **Acceso 100% Solo Lectura**: Eliminación de cualquier control interactivo, botón de mutación o checkbox que pudiera alterar el estado global de la simulación.
- **`AiAnomalyCard` con prop `readOnly`**:
  - Renderizado con opacidad reducida (`opacity-85`).
  - Eliminación del botón de acción `"Marcar como revisado"`, reemplazado por texto de estado del operador (`"Pendiente de revisión por el operador (solo lectura)"` o `"Marcado como revisado por el operador"`).
- **Renombre de "Post-Mortem" a "Caso Cerrado"**:
  - Actualización en `forensic-panel.tsx` para reflejar la terminología oficial: `"Expediente Forense — Caso Cerrado"`.
- **Diseño en Grid de 2 Columnas para "Red Blockchain" e "Hitos de custodia"**:
  - Disposición en paralelo (`grid grid-cols-1 md:grid-cols-2 gap-4`) para optimizar el espacio de lectura.
- **Mejoras de UX en "Estado Criptográfico en Tránsito"**:
  - Disposición en grid angosto (`grid-template-columns: 160px 1fr`) para los pares de datos *(Actor, Org. emisora, Timestamp, TxId, Hash, Estado)* evitando saltos visuales largos.
  - Subtítulo aclaratorio `"Evento más reciente destacado"` para distinguir la tarjeta del feed completo.
- **Ledger criptográfico completo (`Traceability`)**:
  - Subtítulo `"Historial completo del caso"`.
  - Configurado en `techMode` y `role="auditor"` con navegación paginada y filtros avanzados de exploración sin acciones de escritura.
- **Corrección de color del Badge de Estado**:
  - Cambio de tono `warn` (ámbar) a `info` (`primary` `#4fb8c4`) para el estado `"En traslado"`, reservando el color ámbar únicamente para alertas reales de temperatura o isquemia.

---

### 3.2. Separación Completa entre Proveedor IT y Transportador Operativo
- **Creación de `proveedor-it-view.tsx` (Proveedor IT)**:
  - **Zero Trust por defecto**: Bloque de solicitud de acceso Privilegiado (PAM) mediante token mTLS/TOTP.
  - **Restricción PoLP estricta**: Sin acceso a telemetría de temperatura, ventana de isquemia, nivel de batería, señal GPS ni datos clínicos/compatibilidad.
  - **Ficha de Mantenimiento**: Muestra únicamente `caseId`, nodo de origen y nodo de destino, con badge de seguridad `"Acceso Clínico / Custodia: RESTRINGIDO (PoLP)"`.
  - **Salud de la Red Blockchain**: Monitoreo de nodos peers (INCUCAI, Donante, Receptor, Orderer Raft) con estado online/aislado, bloque actual y latencia.
  - **Terminal de Sesión PAM Grabada en Vivo (`PAM-9482`)**:
    - **Bloque colapsable "Contexto del canal"**: Logs históricos previos al inicio de la sesión PAM.
    - **Consola interactiva auto-scrollable**: Auto-desplazamiento a la línea más reciente.
    - **Indicador `● EN VIVO`**: Badge animado con pulso y estado de grabación `PAM-AUDIT-9482.log`.
    - **Colores por severidad y timestamps `T+XhYm`**:
      - `[INFO]`: Gris neutro (`#7d94a8`) para pings `keep-alive` y monitores del canal.
      - `[OK]`: Verde (`#79cf9c`) exclusivo para inicio de sesión PAM, restauraciones de nodos y sincronizaciones.
      - `[WARN]`: Ámbar (`#cfa25e`) para aislamientos preventivos.
      - `[ERROR]`: Rojo (`#e5626a`) para alertas de cifrado por ransomware.
- **Rediseño de `transportador-view.tsx` (Transportador Operativo)**:
  - Consola dedicada exclusivamente a la **custodia física del contenedor**.
  - Visualización en tiempo real de temperatura interna (rango 2-8°C), isquemia acumulada/límite, GPS, batería y barra de progreso del traslado.
  - Panel de **Alertas de Custodia** con capacidad interactiva de resolución (`Resolver`).

---

### 3.3. Componente `Select` Personalizado en Trazabilidad (`traceability.tsx` & `select.tsx`)
- **Implementación de `components/ui/select.tsx`**:
  - Construido utilizando `@base-ui/react/select` integrado con los estilos de la aplicación.
  - Limpieza del atributo `asChild` para eliminar advertencias de atributos DOM en React.
- **Mejora del filtro "Todos los eventos"**:
  - Reemplazo del `<select>` nativo por el componente `<Select>` modal.
  - Grupos delimitados por `<SelectGroup>` y `<SelectLabel>` (*Creación y firma*, *Traslado y custodia*, *Alertas operativas*, *Seguridad e incidentes*, *Auditoría*).
  - Encabezados no interactivos con tipografía `10px font-bold uppercase tracking-wider text-[#54697c]`.
  - Indicadores circulares de severidad (4px):
    - Ámbar (`#cfa25e`) en *Alertas operativas*.
    - Rojo (`#e5626a`) en *Seguridad e incidentes*.
    - Verde tenue (`#10b98166`) en eventos normales.

---

## 4. Matriz de Control de Amenazas y Mitigaciones (Tabla 9)

| Amenaza Identificada | Nivel de Riesgo | Control Implementado en el MVP | Demostración en Interfaz |
| :--- | :---: | :--- | :--- |
| **Insider intenta alterar lista de espera** | Crítico (9.1) | Endorsement Policy de Hyperledger Fabric (requiere 2 firmas institucionales). | Evento `WAITING_LIST_TAMPER_ATTEMPT` grabado con estado `BROKEN` y alerta roja en Auditoría. |
| **Ciberataque de Ransomware en nodo donante** | Crítico (8.8) | Aislamiento automatizado de peer cifrado + tolerancia a fallos por consenso Raft. | Nodo `peer0.hospitaldona` pasa a estado `Aislado (Ransomware)` mientras la red continúa operando. |
| **Acceso no autorizado de IT tercerizado** | Alto (8.4) | Principio de Mínimo Privilegio (PoLP) + Sesión PAM con grabación obligatoria. | La vista `ProveedorITView` aísla por completo los datos de telemetría y clínicos, mostrando únicamente consola de red. |
| **Falsificación de lecturas IoT en tránsito** | Medio (6.5) | Firma digital ECDSA con certificados de dispositivo (IoT CA, TTL 72h) y mTLS. | Registros `IOT_READING_RECEIVED` validados con hash encadenado SHA-256 en el ledger. |

---

## 5. Verificación del Sistema y Ejecución Local

- **Compilación de TypeScript**: 0 errores de compilación (`npm run build`).
- **Servidor Dev**: Operativo en `http://localhost:3000` via Next.js Turbopack.
- **Consola del Navegador**: 0 advertencias de propiedades React / DOM.
