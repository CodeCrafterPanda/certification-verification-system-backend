import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Certificate, CertificateDocument } from './schemas/certificate.schema';
import { Web3Service } from '../blockchain/web3.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CertificateService {
  constructor(
    @InjectModel(Certificate.name) private certificateModel: Model<CertificateDocument>,
    private web3Service: Web3Service,
    private usersService: UsersService
  ) {}

  async issueCertificate(createCertificateDto: CreateCertificateDto, issuerId: string) {
    // Check if recipient exists and is a recipient
    const recipient = await this.usersService.findByEmail(createCertificateDto.recipientEmail);
    if (!recipient) {
      throw new BadRequestException('Recipient is not registered in the system');
    }

    if (recipient.role !== 'recipient') {
      throw new ForbiddenException('Certificates can only be issued to users with recipient role');
    }

    const { hash } = await this.web3Service.generateCertificateHash(createCertificateDto);
    
    // Check if certificate with this hash already exists
    const existingCert = await this.certificateModel.findOne({ hash });
    if (existingCert) {
      throw new BadRequestException('Certificate with this hash already exists');
    }

    // Mock blockchain interaction
    console.log('🔄 Processing certificate issuance...');
    const result = await this.web3Service.issueCertificateOnChain({
      recipientEmail: createCertificateDto.recipientEmail,
      hash,
      metadata: JSON.stringify({
        course: createCertificateDto.course,
        grade: createCertificateDto.grade,
        issueDate: createCertificateDto.issueDate,
        expirationDate: createCertificateDto.expirationDate,
        metadata: createCertificateDto.metadata
      }),
      expirationDate: createCertificateDto.expirationDate 
        ? Math.floor(new Date(createCertificateDto.expirationDate).getTime() / 1000)
        : 0
    });
    console.log('✅ Certificate issued:', result);

    // Save certificate metadata to MongoDB
    const certificate = new this.certificateModel({
      ...createCertificateDto,
      recipientEmail: createCertificateDto.recipientEmail.toLowerCase(),
      hash,
      transactionHash: result.transactionHash,
      issuerId: issuerId.toString(),
      isValid: true
    });

    const savedCert = await certificate.save();
    console.log('Saved certificate details:', {
      id: savedCert._id,
      issuerId: savedCert.issuerId,
      recipient: savedCert.recipient,
      recipientEmail: savedCert.recipientEmail
    });
    return savedCert;
  }

  async verifyCertificate(verifyDto: VerifyCertificateDto) {
    const certificate = await this.certificateModel.findOne({
      $or: [
        { hash: verifyDto.identifier },
        { transactionId: verifyDto.identifier }
      ]
    });

    if (!certificate) {
      return {
        isValid: false,
        message: 'Certificate not found'
      };
    }

    // Check blockchain verification
    const blockchainVerification = await this.web3Service.verifyCertificate(certificate.hash);

    if (!blockchainVerification.isValid) {
      return {
        isValid: false,
        message: 'Certificate verification failed on blockchain',
        certificate
      };
    }

    // Check if certificate is expired
    if (certificate.expirationDate && new Date(certificate.expirationDate) < new Date()) {
      return {
        isValid: false,
        message: 'Certificate has expired',
        certificate,
        verificationDate: new Date()
      };
    }

    // Check if certificate is revoked
    if (!certificate.isValid) {
      return {
        isValid: false,
        message: 'Certificate has been revoked',
        certificate,
        verificationDate: new Date()
      };
    }

    return {
      isValid: true,
      message: 'Certificate is valid',
      certificate,
      verificationDate: new Date()
    };
  }

  async revokeCertificate(certificateId: string, userId: string) {
    const certificate = await this.certificateModel.findById(certificateId);
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    
    // Mock blockchain revocation
    console.log('🔄 Processing certificate revocation...');
    await this.web3Service.revokeCertificate(certificate.hash);
    console.log('✅ Certificate revocation completed');
    
    certificate.isValid = false;
    return await certificate.save();
  }

  async getCertificatesByRecipient(recipientEmail: string) {
    console.log('Searching for certificates with recipientEmail:', recipientEmail);
    const certificates = await this.certificateModel.find({ 
      recipientEmail: recipientEmail.toLowerCase()
    }).sort({ createdAt: -1 });
    
    console.log('Found certificates:', certificates);
    return certificates;
  }

  async getCertificatesByIssuer(issuerId: string) {
    console.log('Searching for certificates with issuerId:', issuerId);
    
    // Log all certificates first to see what's in the database
    const allCerts = await this.certificateModel.find({}).lean();
    console.log('All certificates in DB:', allCerts.map(cert => ({
      id: cert._id,
      issuerId: cert.issuerId,
      recipient: cert.recipient,
      recipientEmail: cert.recipientEmail
    })));
    
    const certificates = await this.certificateModel.find({ 
      issuerId: issuerId.toString()
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${certificates.length} certificates for issuer ${issuerId}`);
    console.log('Certificates:', certificates);
    return certificates;
  }

  async getCertificateById(id: string): Promise<CertificateDocument> {
    const certificate = await this.certificateModel.findById(id);
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }
} 