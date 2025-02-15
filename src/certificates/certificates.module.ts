import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';
import { Web3Service } from '../blockchain/web3.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema }
    ]),
    UsersModule
  ],
  controllers: [CertificateController],
  providers: [CertificateService, Web3Service],
  exports: [CertificateService]
})
export class CertificatesModule {} 