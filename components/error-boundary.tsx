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
          className="flex flex-col items-center justify-center min-h-[100svh] p-8 text-center bg-background text-foreground"
        >
          <div className="max-w-md w-full p-8 rounded-xl border border-border bg-card">
            <p className="text-3xl mb-2">⚠️</p>
            <h1 className="text-xl font-bold text-card-foreground mb-2">
              Algo salió mal
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Ocurrió un error inesperado en la aplicación. Por favor recargá la página.
              Si el problema persiste, contactá al equipo técnico.
            </p>
            {/* Solo mostrar detalles del error en desarrollo */}
            {process.env.NODE_ENV === "development" && this.state.errorMessage && (
              <pre className="bg-muted p-3 rounded-lg text-xs text-left text-danger mb-6 overflow-x-auto whitespace-pre-wrap break-all">
                {this.state.errorMessage}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-2 px-6 rounded-lg text-sm cursor-pointer transition-all"
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
