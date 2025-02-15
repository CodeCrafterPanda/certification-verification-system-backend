import { Module, Global } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Global()
@Module({
  providers: [LoggerService, HttpExceptionFilter],
  exports: [LoggerService, HttpExceptionFilter],
})
export class SharedModule {} 