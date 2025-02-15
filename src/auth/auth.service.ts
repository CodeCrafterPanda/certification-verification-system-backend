import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(registerDto);
      
      const payload = { 
        sub: user._id, 
        email: user.email,
        role: user.role 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    // Check if user exists and is active
    if (!user || !user.isActive) {
      return null;
    }

    // Log password comparison details (for debugging only, remove in production)
    console.log('Password comparison:', {
      provided: password,
      stored: user.password.substring(0, 10) + '...',
    });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(loginDto: LoginDto) {
    console.log('Login attempt:', loginDto.email);
    const user = await this.validateUser(loginDto.email, loginDto.password);
    console.log('Validation result:', user ? 'Success' : 'Failed');
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials or account is inactive');
    }

    const payload = { 
      sub: user._id, 
      email: user.email,
      role: user.role 
    };
    
    const result = {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
    console.log('Login response:', result);
    return result;
  }
} 