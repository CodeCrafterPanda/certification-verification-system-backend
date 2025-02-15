import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';
import { Web3Service } from '../blockchain/web3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema }
    ])
  ],
  controllers: [CertificateController],
  providers: [CertificateService, Web3Service],
  exports: [CertificateService]
})
export class CertificateModule {} 