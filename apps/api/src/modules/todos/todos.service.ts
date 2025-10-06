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

  async getByIdAndUserId(id: string, userId: string) {
    try {
      const todo = await this.prisma.todo.findFirst({
        where: {
          id,
          userId,
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

  async create(data: CreateTodoDto, userId: string) {
    try {
      const todo = await this.prisma.todo.create({
        data: {
          ...data,
          userId,
        },
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

  async updateByIdAndUserId(
    id: string,
    data: Partial<UpdateTodoDto>,
    userId: string,
  ) {
    try {
      const todo = await this.prisma.todo.updateMany({
        where: {
          id,
          userId,
        },
        data,
      });

      if (todo.count === 0) {
        throw new NotFoundException('Todo not found.');
      }

      // Retorna o todo atualizado
      return await this.getByIdAndUserId(id, userId);
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

  async deleteByIdAndUserId(id: string, userId: string) {
    try {
      const todo = await this.prisma.todo.deleteMany({
        where: {
          id,
          userId,
        },
      });

      if (todo.count === 0) {
        throw new NotFoundException('Todo not found.');
      }

      return { message: 'Todo deleted successfully' };
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
