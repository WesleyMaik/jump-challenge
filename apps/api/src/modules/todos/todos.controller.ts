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
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type CurrentUserData,
} from '@/common/decorators/current-user.decorator';

@Controller('/todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('/')
  async getAll(@CurrentUser() user: CurrentUserData) {
    try {
      return await this.todosService.getByUserId(user.id);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  @Get('/me')
  async getMyTodos(@CurrentUser() user: CurrentUserData) {
    try {
      return await this.todosService.getByUserId(user.id);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  @Get('/:id')
  async getById(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return await this.todosService.getByIdAndUserId(id, user.id);
  }

  @Post('/')
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.todosService.create(createTodoDto, user.id);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: Partial<UpdateTodoDto>,
    @CurrentUser() user: CurrentUserData,
  ) {
    return await this.todosService.updateByIdAndUserId(
      id,
      updateTodoDto,
      user.id,
    );
  }

  @Delete('/:id')
  async delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return await this.todosService.deleteByIdAndUserId(id, user.id);
  }
}
