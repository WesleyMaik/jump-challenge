import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  async getAll() {
    try {
      const users = await this.usersService.getAll();
      return users;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.usersService.getById(id);
  }

  @Post('/')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
