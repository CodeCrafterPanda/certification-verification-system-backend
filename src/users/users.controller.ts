import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request,
  ForbiddenException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    const { password, ...userResponse } = user.toObject();
    return userResponse;
  }

  @Get('role/:role')
  @Roles('admin')
  async getUsersByRole(@Param('role') role: string) {
    const users = await this.usersService.findAllByRole(role);
    return users.map(user => {
      const { password, ...userResponse } = user.toObject();
      return userResponse;
    });
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    const { password, ...userResponse } = user.toObject();
    return userResponse;
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(@Param('id') id: string) {
    await this.usersService.deactivate(id);
    return { message: 'User deactivated successfully' };
  }

  @Put(':id/status')
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean }
  ) {
    const user = await this.usersService.updateStatus(id, body.isActive);
    const { password, ...userResponse } = user.toObject();
    return userResponse;
  }

  @Put(':id/role')
  @Roles('admin')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { role: string }
  ) {
    const user = await this.usersService.updateRole(id, body.role);
    const { password, ...userResponse } = user.toObject();
    return userResponse;
  }
} 