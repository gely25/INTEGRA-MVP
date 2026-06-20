"use client"

import React from "react"

/**
 * ErrorBoundary — Componente de manejo de errores
 *
 * ¿Qué hace?
 * En React, si un componente lanza un error JavaScript inesperado,
 * toda la pantalla se pone en blanco. Esto confunde al usuario.
 *
 * Un ErrorBoundary "atrapa" ese error y muestra un mensaje amigable
 * en lugar de la pantalla en blanco.
 *
 * Nota: Solo puede escribirse como clase (class component), no como
 * función. Es una limitación de React que aún no cambió.
 *
 * ⚠️  IMPORTANTE para producción:
 *     No mostrar el error técnico al usuario final.
 *     Aquí mostramos el mensaje solo en desarrollo para ayudarte a depurar.
 */

interface Props {
  children: React.ReactNode
  /** Componente alternativo a mostrar en caso de error (opcional) */
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Se llama cuando un componente hijo lanza un error.
    // Actualiza el estado para mostrar la interfaz de error.
    return {
      hasError: true,
      // Solo guardamos el mensaje, no el stack trace completo.
      errorMessage: error.message,
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Aquí podrías enviar el error a un servicio de monitoreo
    // como Sentry, Datadog, etc. (recomendado en producción).
    // Por ahora solo lo registramos en consola durante desarrollo.
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Error capturado:", error)
      console.error("[ErrorBoundary] Información del componente:", info.componentStack)
    }
    // En producción: NO usar console.log con datos sensibles.
    // En su lugar: enviar a tu servicio de logging.
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null })
  }

  render() {
    if (this.state.hasError) {
      // Si se pasó un fallback personalizado, mostrarlo.
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Interfaz de error por defecto — amigable para el usuario.
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100svh",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              padding: "2rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              background: "#fff",
            }}
          >
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</p>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              Algo salió mal
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Ocurrió un error inesperado en la aplicación. Por favor recargá la página.
              Si el problema persiste, contactá al equipo técnico.
            </p>
            {/* Solo mostrar detalles del error en desarrollo */}
            {process.env.NODE_ENV === "development" && this.state.errorMessage && (
              <pre
                style={{
                  background: "#f1f5f9",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  textAlign: "left",
                  color: "#dc2626",
                  marginBottom: "1.5rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.errorMessage}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                background: "#0e7490",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
