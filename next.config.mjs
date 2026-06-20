/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ TypeScript activo: los errores de tipo rompen el build antes de llegar a producción.
  // No desactivar esto a menos que sea absolutamente necesario.

  // ✅ Headers de seguridad HTTP para todas las respuestas.
  // Estos protegen al navegador del usuario contra ataques comunes.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Evita que el navegador "adivine" el tipo de archivo (MIME sniffing).
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Impide que la app sea embebida en un iframe de otro dominio (clickjacking).
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Controla qué información de "referencia" se envía al navegar a otro sitio.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Limita el acceso a funciones sensibles del navegador (cámara, micrófono, etc.).
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
