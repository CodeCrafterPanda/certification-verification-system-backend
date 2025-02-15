import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyCertificateDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Can be either hash or transaction hash
} 