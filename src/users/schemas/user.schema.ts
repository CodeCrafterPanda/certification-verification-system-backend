import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  timestamps: true,
  collection: 'users'
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, enum: ['issuer', 'verifier', 'admin', 'recipient'], default: 'recipient' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  // Add timestamp fields
  createdAt: Date;
  updatedAt: Date;
}

// Create interface that includes Document and timestamps
export interface UserDocument extends User, Document {
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Only create necessary indexes
UserSchema.index({ role: 1 }); 