import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('/')
  async getAll(@Query('userId') userId?: string) {
    try {
      if (userId) {
        return await this.todosService.getByUserId(userId);
      }
      const todos = await this.todosService.getAll();
      return todos;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.todosService.getById(id);
  }

  @Post('/')
  async create(@Body() createTodoDto: CreateTodoDto) {
    return await this.todosService.create(createTodoDto);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: Partial<UpdateTodoDto>,
  ) {
    return await this.todosService.update(id, updateTodoDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.todosService.delete(id);
  }
}
