import { Controller, Post, Get, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'issuer')
  async issueCertificate(
    @Body() createCertificateDto: CreateCertificateDto,
    @Request() req
  ) {
    return this.certificateService.issueCertificate(createCertificateDto, req.user.id);
  }

  @Post('verify')
  @UseGuards(OptionalJwtAuthGuard)
  async verifyCertificate(@Body() verifyDto: VerifyCertificateDto, @Request() req) {
    const result = await this.certificateService.verifyCertificate(verifyDto);
    if (!result.certificate) {
      return result;
    }

    try {
      // Check if request has valid JWT token
      const user = req.user;
      
      // Admin and verifier can see all details
      if (user && (user.role === 'admin' || user.role === 'verifier')) {
        return {
          isValid: result.isValid,
          message: result.message,
          certificate: result.certificate
        };
      }

      // Recipients can see their own certificate details
      if (user && result.certificate.recipientEmail === user.email) {
        return {
          isValid: result.isValid,
          message: result.message,
          certificate: result.certificate
        };
      }
    } catch (error) {
      // If there's no valid token or any other error, return limited info
      console.log('No valid token or error:', error);
    }

    // Unauthenticated users or others see limited info
    return {
      isValid: result.isValid,
      message: result.message,
      certificate: {
        recipient: result.certificate.recipient,
        course: result.certificate.course,
        isValid: result.certificate.isValid,
        issueDate: result.certificate.issueDate
      }
    };
  }

  @Get('recipient/:email')
  @UseGuards(JwtAuthGuard)
  async getCertificatesByRecipient(@Param('email') email: string, @Request() req) {
    // Admin and verifier can see all certificates
    if (req.user.role === 'admin' || req.user.role === 'verifier') {
      return this.certificateService.getCertificatesByRecipient(email);
    }
    
    // Users can only see their own certificates
    if (email !== req.user.email) {
      throw new ForbiddenException('Not authorized to view these certificates');
    }
    
    return this.certificateService.getCertificatesByRecipient(email);
  }

  @Get('issuer/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'issuer')
  async getCertificatesByIssuer(@Param('id') issuerId: string, @Request() req) {
    console.log('Certificate lookup request:', {
      requestingUserId: req.user.id,
      requestingUserRole: req.user.role,
      requestedIssuerId: issuerId
    });

    // Admin can see any issuer's certificates
    if (req.user.role === 'admin') {
      console.log('Admin requesting certificates for issuer:', issuerId);
      const certificates = await this.certificateService.getCertificatesByIssuer(issuerId);
      console.log('Certificates found:', certificates.length);
      return certificates;
    }
    
    // Issuers can only see their own issued certificates
    if (req.user.role === 'issuer') {
      console.log('Issuer requesting own certificates');
      if (req.user.id.toString() !== issuerId.toString()) {
        throw new ForbiddenException('Not authorized to view these certificates');
      }
      return this.certificateService.getCertificatesByIssuer(req.user.id);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCertificate(@Param('id') id: string, @Request() req) {
    const cert = await this.certificateService.getCertificateById(id);
    
    // Admin and verifier can see all details
    if (req.user.role === 'admin' || req.user.role === 'verifier') {
      return cert;
    }
    
    // Recipients can only see their own certificates
    if (cert.recipientEmail === req.user.email) {
      return cert;
    }
    
    // Others can only see basic info
    return {
      recipient: cert.recipient,
      course: cert.course,
      isValid: cert.isValid,
      issueDate: cert.issueDate
    };
  }

  @Post(':id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'issuer')
  async revokeCertificate(@Param('id') id: string, @Request() req) {
    const cert = await this.certificateService.getCertificateById(id);
    
    // Admin can revoke any certificate
    if (req.user.role === 'admin') {
      return this.certificateService.revokeCertificate(id, req.user.id);
    }
    
    // Issuer can only revoke their own certificates
    if (req.user.role === 'issuer' && cert.issuerId.toString() !== req.user.id) {
      throw new ForbiddenException('Not authorized to revoke this certificate');
    }
    
    return this.certificateService.revokeCertificate(id, req.user.id);
  }
} 