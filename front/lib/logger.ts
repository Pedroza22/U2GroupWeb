// Sistema de logging centralizado
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  source: string
  userId?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private currentLevel: LogLevel = LogLevel.INFO

  constructor() {
    // En producción, solo mostrar errores y warnings
    if (process.env.NODE_ENV === 'production') {
      this.currentLevel = LogLevel.WARN
    } else {
      this.currentLevel = LogLevel.DEBUG
    }
  }

  private addLog(level: LogLevel, message: string, data?: any, source = 'Unknown'): void {
    if (level > this.currentLevel) return

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.sanitizeMessage(message),
      data: this.sanitizeData(data),
      source,
      userId: this.getCurrentUserId()
    }

    this.logs.push(logEntry)
    
    // Mantener solo los últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log a consola con formato
    this.logToConsole(logEntry)
  }

  private sanitizeMessage(message: string): string {
    // Remover información sensible de los mensajes
    return message
      .replace(/password[\s]*[=:]+[\s]*[^&\s]+/gi, 'password=***')
      .replace(/token[\s]*[=:]+[\s]*[^&\s]+/gi, 'token=***')
      .replace(/key[\s]*[=:]+[\s]*[^&\s]+/gi, 'key=***')
      .replace(/email[\s]*[=:]+[\s]*[^&\s]+/gi, 'email=***')
  }

  private sanitizeData(data: any): any {
    if (!data) return data
    
    if (typeof data === 'string') {
      return this.sanitizeMessage(data)
    }
    
    if (typeof data === 'object') {
      const sanitized = { ...data }
      // Remover campos sensibles
      const sensitiveFields = ['password', 'token', 'key', 'secret', 'credential']
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '***'
        }
      })
      return sanitized
    }
    
    return data
  }

  private getCurrentUserId(): string | undefined {
    // En una implementación real, obtener del contexto de autenticación
    try {
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        return userData.id || 'anonymous'
      }
    } catch {
      // Silenciar errores
    }
    return 'anonymous'
  }

  private logToConsole(entry: LogEntry): void {
    const emoji = {
      [LogLevel.ERROR]: '❌',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.DEBUG]: '🔧'
    }

    const levelName = LogLevel[entry.level]
    const prefix = `${emoji[entry.level]} [${levelName}] ${entry.source}`
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data)
        break
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data)
        break
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data)
        break
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data)
        break
    }
  }

  // Métodos públicos
  error(message: string, data?: any, source = 'App'): void {
    this.addLog(LogLevel.ERROR, message, data, source)
  }

  warn(message: string, data?: any, source = 'App'): void {
    this.addLog(LogLevel.WARN, message, data, source)
  }

  info(message: string, data?: any, source = 'App'): void {
    this.addLog(LogLevel.INFO, message, data, source)
  }

  debug(message: string, data?: any, source = 'App'): void {
    this.addLog(LogLevel.DEBUG, message, data, source)
  }

  // Obtener logs para debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level <= level)
    }
    return [...this.logs]
  }

  // Limpiar logs
  clearLogs(): void {
    this.logs = []
    this.info('Logs limpiados', {}, 'Logger')
  }

  // Exportar logs para debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Instancia singleton
export const logger = new Logger()

// Helper para tracking de errores de API
export const trackApiCall = (endpoint: string, method: string, status?: number, error?: any) => {
  const source = 'API'
  
  if (error) {
    logger.error(`API Error: ${method} ${endpoint}`, {
      endpoint,
      method,
      status,
      error: error.message || error,
      stack: error.stack
    }, source)
  } else if (status && status >= 400) {
    logger.warn(`API Warning: ${method} ${endpoint} returned ${status}`, {
      endpoint,
      method,
      status
    }, source)
  } else {
    logger.debug(`API Call: ${method} ${endpoint}`, {
      endpoint,
      method,
      status: status || 'success'
    }, source)
  }
}

// Helper para tracking de navegación
export const trackNavigation = (from: string, to: string) => {
  logger.info('Navigation', { from, to }, 'Router')
}

// Helper para tracking de formularios
export const trackFormSubmission = (formName: string, success: boolean, error?: any) => {
  if (success) {
    logger.info(`Form submitted: ${formName}`, { formName }, 'Forms')
  } else {
    logger.error(`Form error: ${formName}`, { formName, error }, 'Forms')
  }
} 