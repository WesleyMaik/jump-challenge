import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { OwnerOrAdminGuard } from '../auth/guards/owner-or-admin.guard';
import {
  CurrentUser,
  type CurrentUserData,
} from '@/common/decorators/current-user.decorator';
import { ResourceOwner } from '@/common/decorators/resource-owner.decorator';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAll() {
    try {
      const users = await this.usersService.getAll();
      return users;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @ResourceOwner('id')
  async getMe(@CurrentUser() user: CurrentUserData) {
    return await this.usersService.getById(user.id);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @ResourceOwner('id')
  async getById(@Param('id') id: string) {
    return await this.usersService.getById(id);
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @ResourceOwner('id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @ResourceOwner('id')
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
