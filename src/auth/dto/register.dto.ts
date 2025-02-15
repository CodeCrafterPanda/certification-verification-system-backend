import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['issuer', 'verifier', 'admin', 'recipient'], {
    message: 'Role must be either issuer, verifier, admin, or recipient'
  })
  role: string;
} 