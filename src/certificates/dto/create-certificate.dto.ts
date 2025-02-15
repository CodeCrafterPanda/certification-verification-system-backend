import { IsString, IsEmail, IsNotEmpty, IsOptional, IsDateString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCertificateDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsString()
  @IsNotEmpty()
  course: string;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsObject()
  @IsOptional()
  @Type(() => Object)
  metadata?: Record<string, any>;
} 