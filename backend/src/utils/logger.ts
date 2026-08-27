/**
 * Simple logger utility for the application
 * In production, this would be replaced with Winston or a similar structured logger
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: any;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    const env = process.env.NODE_ENV || 'development';
    this.logLevel = env === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private writeLog(entry: LogEntry): void {
    const logString = JSON.stringify(entry);
    
    switch (entry.level) {
      case 'DEBUG':
        if (this.shouldLog(LogLevel.DEBUG)) {
          console.debug(logString);
        }
        break;
      case 'INFO':
        if (this.shouldLog(LogLevel.INFO)) {
          console.info(logString);
        }
        break;
      case 'WARN':
        if (this.shouldLog(LogLevel.WARN)) {
          console.warn(logString);
        }
        break;
      case 'ERROR':
        if (this.shouldLog(LogLevel.ERROR)) {
          console.error(logString);
        }
        break;
      default:
        console.log(logString);
    }
  }

  public debug(message: string, context?: any): void {
    const entry = this.formatMessage('DEBUG', message, context);
    this.writeLog(entry);
  }

  public info(message: string, context?: any): void {
    const entry = this.formatMessage('INFO', message, context);
    this.writeLog(entry);
  }

  public warn(message: string, context?: any): void {
    const entry = this.formatMessage('WARN', message, context);
    this.writeLog(entry);
  }

  public error(message: string, context?: any): void {
    const entry = this.formatMessage('ERROR', message, context);
    this.writeLog(entry);
  }
}

// Export singleton instance
export const logger = new Logger();