import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    console.log('Attempting to create user:', createUserDto.email);
    
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email.toLowerCase() 
    });
    
    console.log('Existing user check result:', existingUser);
    
    if (existingUser) {
      console.log('User already exists with email:', createUserDto.email);
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword
    });

    try {
      const savedUser = await user.save();
      console.log('User created successfully:', savedUser.email);
      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    console.log('Finding user by email:', email);
    const user = await this.userModel.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    console.log('Find by email result:', user ? 'User found' : 'User not found');
    return user;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({ 
        email: updateUserDto.email,
        _id: { $ne: id }
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserDto },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRole(id: string, role: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deactivate(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async findAllByRole(role: string): Promise<UserDocument[]> {
    return this.userModel.find({ 
      role,
      isActive: true 
    }).sort({ createdAt: -1 });
  }

  async updateStatus(id: string, isActive: boolean): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
} 