import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    try {
      const todos = await this.prisma.todo.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return todos;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const todo = await this.prisma.todo.findUnique({
        where: {
          id,
        },
      });

      if (!todo) {
        throw new NotFoundException('Todo not found.');
      }

      return todo;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Todo not found.');
        }
      }
      throw error;
    }
  }

  async getByUserId(userId: string) {
    try {
      const todos = await this.prisma.todo.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return todos;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(data: CreateTodoDto) {
    try {
      const todo = await this.prisma.todo.create({
        data,
      });
      return todo;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid user ID.');
        }
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateTodoDto>) {
    try {
      const todo = await this.prisma.todo.update({
        where: {
          id,
        },
        data,
      });
      return todo;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid todo data.');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Todo not found.');
        }
      }

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const todo = await this.prisma.todo.delete({
        where: {
          id,
        },
      });

      if (!todo) {
        throw new NotFoundException('Todo not found.');
      }

      return todo;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Todo not found.');
        }
      }
      console.error(error);
      throw error;
    }
  }
}
