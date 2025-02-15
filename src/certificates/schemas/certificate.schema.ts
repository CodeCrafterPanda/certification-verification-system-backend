import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Certificate {
  @Prop({ required: true })
  recipient: string;

  @Prop({ required: true, index: true })
  recipientEmail: string;

  @Prop({ required: true })
  course: string;

  @Prop({ required: true })
  grade: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop()
  expirationDate?: Date;

  @Prop({ default: false })
  requiresRenewal: boolean;

  @Prop({ required: true })
  hash: string;

  @Prop()
  transactionHash?: string;

  @Prop({ required: true })
  issuerId: string;

  @Prop({ default: true })
  isValid: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export type CertificateDocument = Certificate & Document;
export const CertificateSchema = SchemaFactory.createForClass(Certificate);

// Add indexes for faster queries
CertificateSchema.index({ hash: 1 }, { unique: true });
CertificateSchema.index({ recipientEmail: 1 });
CertificateSchema.index({ transactionHash: 1 }, { unique: true }); 