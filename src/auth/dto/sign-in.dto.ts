import { IsString, IsEthereumAddress } from 'class-validator';

export class SignInDto {
  @IsEthereumAddress()
  address: string;

  @IsString()
  message: string;

  @IsString()
  signature: string;
} 