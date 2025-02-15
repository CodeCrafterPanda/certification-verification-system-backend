import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string) {
    console.log(`[${context || 'Application'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${context || 'Application'}] ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string) {
    console.warn(`[${context || 'Application'}] ${message}`);
  }

  debug(message: string, context?: string) {
    console.debug(`[${context || 'Application'}] ${message}`);
  }

  verbose(message: string, context?: string) {
    console.log(`[${context || 'Application'}] ${message}`);
  }
} 